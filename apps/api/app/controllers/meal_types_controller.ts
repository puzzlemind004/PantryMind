import type { HttpContext } from '@adonisjs/core/http'

import MealType from '#models/meal_type'
import MealTypeTransformer from '#transformers/meal_type_transformer'
import { mealTypeValidator, updateMealTypeValidator } from '#validators/household'

export default class MealTypesController {
  async index({ household, serialize }: HttpContext) {
    const mealTypes = await MealType.query()
      .where('household_id', household.id)
      .orderBy('position', 'asc')

    return serialize(MealTypeTransformer.transform(mealTypes))
  }

  async store({ household, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(mealTypeValidator)

    const mealType = await MealType.create({ ...payload, householdId: household.id })

    response.status(201)
    return serialize(MealTypeTransformer.transform(mealType))
  }

  async update({ household, params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateMealTypeValidator)

    const mealType = await MealType.query()
      .where('household_id', household.id)
      .where('id', params.mealTypeId)
      .firstOrFail()

    mealType.merge(payload)
    await mealType.save()

    return serialize(MealTypeTransformer.transform(mealType))
  }

  async destroy({ household, params, response }: HttpContext) {
    const mealType = await MealType.query()
      .where('household_id', household.id)
      .where('id', params.mealTypeId)
      .firstOrFail()

    await mealType.delete()

    return response.noContent()
  }
}
