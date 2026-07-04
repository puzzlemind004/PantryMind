import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

import PlannedMeal from '#models/planned_meal'
import MealValidationService from '#services/meal_validation_service'
import PlannedMealTransformer from '#transformers/planned_meal_transformer'
import { UNIT_CODES } from '#services/unit_service'

export const completeMealValidator = vine.create({
  version: vine.number().min(1),
  /** User-adjusted consumption list (5.3); omitted = theoretical needs. */
  items: vine
    .array(
      vine.object({
        productId: vine.string().uuid(),
        quantity: vine.number().min(0),
        unit: vine.enum(UNIT_CODES),
      })
    )
    .optional(),
})

export default class MealValidationsController {
  /** Read-only simulation of the meal needs vs stock (spec §8.6). */
  async preview({ household, params, response, serialize }: HttpContext) {
    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }

    return serialize({ needs: await MealValidationService.preview(meal, household) })
  }

  /** Validates the meal as done and consumes the stock (spec 5.2). */
  async complete({ household, params, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(completeMealValidator)

    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }

    const results = await MealValidationService.complete(
      meal,
      household,
      auth.getUserOrFail(),
      payload
    )

    return serialize({
      meal: PlannedMealTransformer.transform(meal),
      results,
    })
  }

  private findMeal(householdId: string, mealId: string) {
    return PlannedMeal.query()
      .where('household_id', householdId)
      .where('id', mealId)
      .preload('mealType')
      .preload('recipes')
      .first()
  }

  private notFound(response: HttpContext['response']) {
    return response.notFound({
      errors: [{ code: 'MEAL_NOT_FOUND', message: 'Planned meal not found' }],
    })
  }
}
