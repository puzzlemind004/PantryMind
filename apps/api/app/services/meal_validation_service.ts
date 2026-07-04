import { Exception } from '@adonisjs/core/exceptions'

import ActivityLogService from '#services/activity_log_service'
import PlanningService from '#services/planning_service'
import StockAvailabilityService from '#services/stock_availability_service'
import StockService from '#services/stock_service'
import UnitService from '#services/unit_service'
import type Household from '#models/household'
import type PlannedMeal from '#models/planned_meal'
import type User from '#models/user'

/** One aggregated ingredient need for a meal (spec 5.14-like merge). */
export interface MealNeed {
  productId: string
  productName: string
  quantity: number
  unit: string
  optional: boolean
  available: number
  missing: number
  substitutes: { productId: string; productName: string; available: number }[]
}

export interface ConsumptionItem {
  productId: string
  quantity: number
  unit: string
}

/**
 * Meal validation (spec 5.2): the only path from a planned meal to the
 * stock. Everything before "complete" is a read-only simulation.
 */
export default class MealValidationService {
  /**
   * Computed needs of a meal (spec §8.6): snapshot quantities scaled to
   * the requested servings (5.10), merged across recipes, with current
   * availability and substitute availability (5.8).
   */
  static async preview(meal: PlannedMeal, household: Household): Promise<MealNeed[]> {
    await meal.load('recipes')

    /** Merge by product, converting into the first-seen unit when possible. */
    const needs: MealNeed[] = []
    const substituteRequests: { productId: string; unit: string }[] = []

    for (const mealRecipe of meal.recipes) {
      const ratio = mealRecipe.servings / mealRecipe.snapshot.baseServings
      for (const ingredient of mealRecipe.snapshot.ingredients) {
        const quantity = Number((ingredient.quantity * ratio).toFixed(3))

        const existing = needs.find((need) => {
          if (need.productId !== ingredient.productId) {
            return false
          }
          return UnitService.convert(1, ingredient.unit, need.unit) !== null
        })

        if (existing) {
          const converted = UnitService.convert(quantity, ingredient.unit, existing.unit)!
          existing.quantity = Number((existing.quantity + converted).toFixed(3))
          /** Required by any recipe → required for the meal (spec 5.9). */
          existing.optional = existing.optional && ingredient.optional
        } else {
          needs.push({
            productId: ingredient.productId,
            productName: ingredient.productName,
            quantity,
            unit: ingredient.unit,
            optional: ingredient.optional,
            available: 0,
            missing: 0,
            substitutes: ingredient.substitutes.map((substitute) => ({
              productId: substitute.productId,
              productName: substitute.productName,
              available: 0,
            })),
          })
          for (const substitute of ingredient.substitutes) {
            substituteRequests.push({ productId: substitute.productId, unit: ingredient.unit })
          }
        }
      }
    }

    const availability = await StockAvailabilityService.availabilityFor(household.id, [
      ...needs.map((need) => ({ productId: need.productId, unit: need.unit })),
      ...substituteRequests,
    ])

    for (const need of needs) {
      need.available = availability.get(need.productId) ?? 0
      need.missing = Math.max(Number((need.quantity - need.available).toFixed(3)), 0)
      for (const substitute of need.substitutes) {
        substitute.available = availability.get(substitute.productId) ?? 0
      }
    }

    return needs
  }

  /**
   * Marks the meal as done and consumes the stock (spec 5.2). The item
   * list is the user-adjusted truth (5.3) — substitutions are just items
   * pointing to the substitute product (5.8). Without an explicit list,
   * the theoretical needs are used, skipping optional ingredients that
   * are absent from the stock (5.9). Missing quantities are reported,
   * never blocking (5.4, 7.5).
   */
  static async complete(
    meal: PlannedMeal,
    household: Household,
    user: User,
    payload: { version: number; items?: ConsumptionItem[] }
  ) {
    PlanningService.assertVersion(meal, payload.version)
    if (meal.status !== 'planned') {
      throw new Exception('Ce repas a déjà été validé ou annulé', {
        status: 422,
        code: 'MEAL_NOT_PLANNED',
      })
    }

    const items = payload.items ?? (await this.defaultItems(meal, household))

    const results: {
      productId: string
      requested: number
      consumed: number
      missing: number
      unit: string
    }[] = []
    for (const item of items) {
      if (item.quantity <= 0) {
        continue
      }
      const outcome = await StockService.consumeProductFifo(household, user, {
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        context: { plannedMealId: meal.id },
      })
      results.push({
        productId: item.productId,
        requested: item.quantity,
        unit: item.unit,
        consumed: Number((item.quantity - outcome.missingQuantity).toFixed(3)),
        missing: outcome.missingQuantity,
      })
    }

    meal.status = 'done'
    meal.version += 1
    await meal.save()

    await ActivityLogService.record({
      householdId: household.id,
      userId: user.id,
      action: 'planned_meal.completed',
      subjectType: 'planned_meal',
      subjectId: meal.id,
      data: { results },
    })

    return results
  }

  /** Theoretical consumption: needs minus absent optional ingredients (5.9). */
  private static async defaultItems(
    meal: PlannedMeal,
    household: Household
  ): Promise<ConsumptionItem[]> {
    const needs = await this.preview(meal, household)
    return needs
      .filter((need) => !need.optional || need.available > 0)
      .map((need) => ({
        productId: need.productId,
        /** Optional ingredients are consumed only as far as available (5.9). */
        quantity: need.optional ? Math.min(need.quantity, need.available) : need.quantity,
        unit: need.unit,
      }))
  }
}
