/** Lifecycle of a planned meal (spec §4.10, 5.2, 7.2). */
export const PLANNED_MEAL_STATUSES = ['planned', 'done', 'cancelled'] as const
export type PlannedMealStatus = (typeof PLANNED_MEAL_STATUSES)[number]

/**
 * Frozen copy of a recipe attached to a planned meal (spec 7.3).
 * Written once at planning time, never recomputed from the recipe.
 */
export interface MealRecipeSnapshot {
  name: string
  baseServings: number
  ingredients: SnapshotIngredient[]
}

export interface SnapshotIngredient {
  productId: string
  productName: string
  quantity: number
  unit: string
  optional: boolean
  substitutes: { productId: string; productName: string }[]
}
