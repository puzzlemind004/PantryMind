import type MealType from '#models/meal_type'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class MealTypeTransformer extends BaseTransformer<MealType> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'householdId', 'name', 'position']),
      /** Normalized to "HH:mm" (PostgreSQL time columns serialize as "HH:mm:ss"). */
      defaultTime: this.resource.defaultTime?.slice(0, 5) ?? null,
    }
  }
}
