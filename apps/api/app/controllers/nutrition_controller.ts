import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

import { toDateTime } from '#helpers/dates'
import PlannedMeal from '#models/planned_meal'
import NutritionService, { NUTRIENT_KEYS } from '#services/nutrition_service'
import RecipeService from '#services/recipe_service'
import type { NutritionTotals } from '#services/nutrition_service'

export const recipeNutritionValidator = vine.create({
  servings: vine.number().min(1).max(50).optional(),
})

export const dailyNutritionValidator = vine.create({
  date: vine.date(),
})

/** Nutrition read endpoints (spec §2: recette, repas, journée). */
export default class NutritionController {
  async recipe({ household, params, request, response, serialize }: HttpContext) {
    const { servings } = await request.validateUsing(recipeNutritionValidator)

    const recipe = await RecipeService.baseQuery(household).where('id', params.recipeId).first()
    if (!recipe) {
      return response.notFound({
        errors: [{ code: 'RECIPE_NOT_FOUND', message: 'Recipe not found' }],
      })
    }

    return serialize(await NutritionService.forRecipe(recipe, servings))
  }

  async meal({ household, params, response, serialize }: HttpContext) {
    const meal = await PlannedMeal.query()
      .where('household_id', household.id)
      .where('id', params.mealId)
      .first()
    if (!meal) {
      return response.notFound({
        errors: [{ code: 'MEAL_NOT_FOUND', message: 'Planned meal not found' }],
      })
    }

    return serialize(await NutritionService.forPlannedMeal(meal))
  }

  /** Daily summary: all non-cancelled meals of the date (spec §2). */
  async daily({ household, request, serialize }: HttpContext) {
    const { date } = await request.validateUsing(dailyNutritionValidator)
    const isoDate = toDateTime(date).toISODate()!

    const meals = await PlannedMeal.query()
      .where('household_id', household.id)
      .where('date', isoDate)
      .whereNot('status', 'cancelled')
      .preload('mealType')

    const perMeal: {
      mealId: string
      mealName: string
      status: string
      totals: NutritionTotals
      missingProducts: string[]
    }[] = []
    const dayTotals: NutritionTotals = {}

    for (const meal of meals) {
      const summary = await NutritionService.forPlannedMeal(meal)
      perMeal.push({
        mealId: meal.id,
        mealName: meal.mealName,
        status: meal.status,
        totals: summary.totals,
        missingProducts: summary.missingProducts,
      })
      for (const key of NUTRIENT_KEYS) {
        const value = summary.totals[key]
        if (typeof value === 'number') {
          dayTotals[key] = Number(((dayTotals[key] ?? 0) + value).toFixed(1))
        }
      }
    }

    return serialize({ date: isoDate, totals: dayTotals, meals: perMeal })
  }
}
