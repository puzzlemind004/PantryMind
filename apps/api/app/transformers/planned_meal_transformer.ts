import type PlannedMeal from '#models/planned_meal'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class PlannedMealTransformer extends BaseTransformer<PlannedMeal> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'householdId',
        'mealTypeId',
        'mealName',
        'status',
        'notes',
        'version',
        'effectiveTime',
      ]),
      date: this.resource.date?.toISODate() ?? null,
      timeOverride: this.resource.timeOverride?.slice(0, 5) ?? null,
      /** Snapshots as plain objects (deep-nested transformers are not resolved). */
      recipes: this.resource.recipes?.map((mealRecipe) => ({
        id: mealRecipe.id,
        recipeId: mealRecipe.recipeId,
        servings: mealRecipe.servings,
        snapshot: mealRecipe.snapshot,
      })),
    }
  }
}
