import type { HttpContext } from '@adonisjs/core/http'

import { toDateTime } from '#helpers/dates'
import PlannedMeal from '#models/planned_meal'
import PlannedMealRecipe from '#models/planned_meal_recipe'
import PlanningService from '#services/planning_service'
import PlannedMealTransformer from '#transformers/planned_meal_transformer'
import {
  addMealRecipeValidator,
  cancelPlannedMealValidator,
  createPlannedMealValidator,
  duplicatePlannedMealValidator,
  listPlannedMealsValidator,
  updateMealRecipeValidator,
  updatePlannedMealValidator,
} from '#validators/planning'

export default class PlannedMealsController {
  /** Meals of a period — the weekly view queries one week (spec §8.5). */
  async index({ household, request, serialize }: HttpContext) {
    const { from, to } = await request.validateUsing(listPlannedMealsValidator)

    const meals = await PlanningService.listBetween(
      household,
      toDateTime(from).toISODate()!,
      toDateTime(to).toISODate()!
    )

    return serialize(PlannedMealTransformer.transform(meals))
  }

  async store({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createPlannedMealValidator)

    const meal = await PlanningService.create(household, auth.getUserOrFail(), {
      ...payload,
      date: toDateTime(payload.date),
    })

    response.status(201)
    return serialize(PlannedMealTransformer.transform(meal))
  }

  async show({ household, params, response, serialize }: HttpContext) {
    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }
    return serialize(PlannedMealTransformer.transform(meal))
  }

  /** Move / retype / retime / annotate (spec §6.4), version-guarded (spec 7.8). */
  async update({ household, params, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(updatePlannedMealValidator)

    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }

    await PlanningService.update(meal, household, {
      ...payload,
      date: payload.date !== undefined ? toDateTime(payload.date) : undefined,
    })

    return serialize(PlannedMealTransformer.transform(meal))
  }

  /** Removing a planned meal has no stock impact (spec 7.2). */
  async destroy({ household, params, response }: HttpContext) {
    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }
    if (meal.status === 'done') {
      return response.unprocessableEntity({
        errors: [
          {
            code: 'MEAL_ALREADY_DONE',
            message: 'Un repas validé ne peut pas être supprimé (historique)',
          },
        ],
      })
    }

    await meal.delete()
    return response.noContent()
  }

  async cancel({ household, params, auth, request, response, serialize }: HttpContext) {
    const { version } = await request.validateUsing(cancelPlannedMealValidator)

    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }

    await PlanningService.cancel(meal, auth.getUserOrFail(), version)
    return serialize(PlannedMealTransformer.transform(meal))
  }

  /** Duplication vers une date unique ou plusieurs jours (spec §6.4). */
  async duplicate({ household, params, request, response, serialize }: HttpContext) {
    const { date, dates } = await request.validateUsing(duplicatePlannedMealValidator)

    const targetDates = [...(dates ?? []), ...(date ? [date] : [])].map(toDateTime)
    if (targetDates.length === 0) {
      return response.unprocessableEntity({
        errors: [{ code: 'DATE_REQUIRED', message: 'Provide date or dates' }],
      })
    }

    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }

    const copies = await PlanningService.duplicate(meal, targetDates)

    response.status(201)
    return serialize({ meals: PlannedMealTransformer.transform(copies) })
  }

  /** Attaches a recipe (snapshot frozen at this instant, spec 7.3). */
  async addRecipe({ household, params, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(addMealRecipeValidator)

    const meal = await this.findMeal(household.id, params.mealId)
    if (!meal) {
      return this.notFound(response)
    }

    await PlanningService.addRecipe(meal, household, payload)
    await meal.load('recipes')

    response.status(201)
    return serialize(PlannedMealTransformer.transform(meal))
  }

  async updateRecipe({ household, params, request, response, serialize }: HttpContext) {
    const { servings } = await request.validateUsing(updateMealRecipeValidator)

    const meal = await this.findMeal(household.id, params.mealId)
    const mealRecipe = meal
      ? await PlannedMealRecipe.query()
          .where('planned_meal_id', meal.id)
          .where('id', params.mealRecipeId)
          .first()
      : null
    if (!meal || !mealRecipe) {
      return this.notFound(response)
    }

    await PlanningService.updateRecipeServings(mealRecipe, servings)
    await meal.load('recipes')

    return serialize(PlannedMealTransformer.transform(meal))
  }

  async removeRecipe({ household, params, response }: HttpContext) {
    const meal = await this.findMeal(household.id, params.mealId)
    const mealRecipe = meal
      ? await PlannedMealRecipe.query()
          .where('planned_meal_id', meal.id)
          .where('id', params.mealRecipeId)
          .first()
      : null
    if (!meal || !mealRecipe) {
      return this.notFound(response)
    }

    await PlanningService.removeRecipe(meal, mealRecipe)
    return response.noContent()
  }

  private async findMeal(householdId: string, mealId: string) {
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
