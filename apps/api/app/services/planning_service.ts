import type { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'

import MealType from '#models/meal_type'
import PlannedMeal from '#models/planned_meal'
import PlannedMealRecipe from '#models/planned_meal_recipe'
import Recipe from '#models/recipe'
import ActivityLogService from '#services/activity_log_service'
import type Household from '#models/household'
import type User from '#models/user'
import type { MealRecipeSnapshot } from '#types/planning'

export default class PlanningService {
  /** Meals of a period, snapshots and meal types preloaded. */
  static listBetween(household: Household, from: string, to: string) {
    return PlannedMeal.query()
      .where('household_id', household.id)
      .whereBetween('date', [from, to])
      .preload('mealType')
      .preload('recipes')
      .orderBy('date', 'asc')
  }

  static async create(
    household: Household,
    user: User,
    payload: {
      date: DateTime
      mealTypeId: string
      timeOverride?: string | null
      notes?: string | null
      recipes?: { recipeId: string; servings?: number }[]
    }
  ) {
    const mealType = await MealType.query()
      .where('household_id', household.id)
      .where('id', payload.mealTypeId)
      .first()
    if (!mealType) {
      throw new Exception('Type de repas inconnu pour ce foyer', {
        status: 422,
        code: 'MEAL_TYPE_NOT_FOUND',
      })
    }

    return db.transaction(async (trx) => {
      const meal = await PlannedMeal.create(
        {
          householdId: household.id,
          date: payload.date,
          mealTypeId: mealType.id,
          mealName: mealType.name,
          timeOverride: payload.timeOverride ?? null,
          status: 'planned',
          notes: payload.notes ?? null,
          version: 1,
        },
        { client: trx }
      )

      for (const recipeRequest of payload.recipes ?? []) {
        await this.attachRecipe(meal, household, recipeRequest, trx)
      }

      await ActivityLogService.record({
        householdId: household.id,
        userId: user.id,
        action: 'planned_meal.created',
        subjectType: 'planned_meal',
        subjectId: meal.id,
        data: { date: payload.date.toISODate(), mealName: mealType.name },
        trx,
      })

      await meal.load('mealType')
      await meal.load('recipes')
      return meal
    })
  }

  /**
   * Structural update (move, retype, time, notes) guarded by optimistic
   * locking (spec 7.8): a stale version gets a 409, never a silent
   * overwrite.
   */
  static async update(
    meal: PlannedMeal,
    household: Household,
    payload: {
      version: number
      date?: DateTime
      mealTypeId?: string
      timeOverride?: string | null
      notes?: string | null
    }
  ) {
    this.assertVersion(meal, payload.version)

    if (payload.mealTypeId && payload.mealTypeId !== meal.mealTypeId) {
      const mealType = await MealType.query()
        .where('household_id', household.id)
        .where('id', payload.mealTypeId)
        .first()
      if (!mealType) {
        throw new Exception('Type de repas inconnu pour ce foyer', {
          status: 422,
          code: 'MEAL_TYPE_NOT_FOUND',
        })
      }
      meal.mealTypeId = mealType.id
      meal.mealName = mealType.name
    }

    meal.merge({
      ...(payload.date !== undefined ? { date: payload.date } : {}),
      ...(payload.timeOverride !== undefined ? { timeOverride: payload.timeOverride } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    })
    meal.version += 1
    await meal.save()
    await meal.load('mealType')
    await meal.load('recipes')
    return meal
  }

  /** Adds a recipe to a meal by freezing its snapshot (spec 7.3). */
  static async addRecipe(
    meal: PlannedMeal,
    household: Household,
    payload: { recipeId: string; servings?: number }
  ) {
    return db.transaction(async (trx) => {
      meal.useTransaction(trx)
      const mealRecipe = await this.attachRecipe(meal, household, payload, trx)
      meal.version += 1
      await meal.save()
      return mealRecipe
    })
  }

  static async updateRecipeServings(mealRecipe: PlannedMealRecipe, servings: number) {
    mealRecipe.servings = servings
    await mealRecipe.save()
    return mealRecipe
  }

  static async removeRecipe(meal: PlannedMeal, mealRecipe: PlannedMealRecipe) {
    await mealRecipe.delete()
    meal.version += 1
    await meal.save()
  }

  /**
   * Duplicates a meal (recipes included) to one or several target dates
   * (spec §6.4 : ex. reporter le petit-déjeuner sur toute la semaine).
   * Each copy is an independent meal with its own snapshots.
   */
  static async duplicate(meal: PlannedMeal, targetDates: DateTime[]) {
    await meal.load('recipes')

    return db.transaction(async (trx) => {
      const copies: PlannedMeal[] = []

      for (const targetDate of targetDates) {
        const copy = await PlannedMeal.create(
          {
            householdId: meal.householdId,
            date: targetDate,
            mealTypeId: meal.mealTypeId,
            mealName: meal.mealName,
            timeOverride: meal.timeOverride,
            status: 'planned',
            notes: meal.notes,
            version: 1,
          },
          { client: trx }
        )

        for (const mealRecipe of meal.recipes) {
          await PlannedMealRecipe.create(
            {
              plannedMealId: copy.id,
              recipeId: mealRecipe.recipeId,
              servings: mealRecipe.servings,
              snapshot: mealRecipe.snapshot,
            },
            { client: trx }
          )
        }

        copies.push(copy)
      }

      for (const copy of copies) {
        await copy.load('mealType')
        await copy.load('recipes')
      }
      return copies
    })
  }

  /** Cancelling never touches the stock (spec 7.2). */
  static async cancel(meal: PlannedMeal, user: User, version: number) {
    this.assertVersion(meal, version)
    meal.status = 'cancelled'
    meal.version += 1
    await meal.save()

    await ActivityLogService.record({
      householdId: meal.householdId,
      userId: user.id,
      action: 'planned_meal.cancelled',
      subjectType: 'planned_meal',
      subjectId: meal.id,
    })

    return meal
  }

  static assertVersion(meal: PlannedMeal, version: number) {
    if (meal.version !== version) {
      throw new Exception('Le repas a été modifié par quelqu’un d’autre — rechargez-le', {
        status: 409,
        code: 'VERSION_CONFLICT',
      })
    }
  }

  /** Builds the frozen snapshot from the current recipe state. */
  private static async attachRecipe(
    meal: PlannedMeal,
    household: Household,
    payload: { recipeId: string; servings?: number },
    trx: Parameters<PlannedMeal['useTransaction']>[0]
  ) {
    const recipe = await Recipe.query()
      .where('household_id', household.id)
      .whereNull('deleted_at')
      .where('id', payload.recipeId)
      .preload('ingredients', (query) =>
        query
          .preload('product')
          .preload('substitutes', (sub) => sub.preload('product'))
          .orderBy('position')
      )
      .first()

    if (!recipe) {
      throw new Exception('Recette inconnue pour ce foyer', {
        status: 422,
        code: 'RECIPE_NOT_FOUND',
      })
    }

    const snapshot: MealRecipeSnapshot = {
      name: recipe.name,
      baseServings: recipe.servings,
      ingredients: recipe.ingredients.map((ingredient) => ({
        productId: ingredient.productId,
        productName: ingredient.product.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        optional: ingredient.optional,
        substitutes: ingredient.substitutes.map((substitute) => ({
          productId: substitute.productId,
          productName: substitute.product.name,
        })),
      })),
    }

    return PlannedMealRecipe.create(
      {
        plannedMealId: meal.id,
        recipeId: recipe.id,
        servings: payload.servings ?? recipe.servings,
        snapshot,
      },
      { client: trx }
    )
  }
}
