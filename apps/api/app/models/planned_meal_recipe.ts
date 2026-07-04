import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { PlannedMealRecipeSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import PlannedMeal from '#models/planned_meal'
import Recipe from '#models/recipe'
import type { MealRecipeSnapshot } from '#types/planning'

/**
 * A recipe attached to a planned meal through its frozen snapshot
 * (spec 7.3): later recipe edits never affect this row.
 */
export default class PlannedMealRecipe extends withUuidPrimaryKey(PlannedMealRecipeSchema) {
  declare snapshot: MealRecipeSnapshot

  @belongsTo(() => PlannedMeal)
  declare plannedMeal: BelongsTo<typeof PlannedMeal>

  @belongsTo(() => Recipe)
  declare recipe: BelongsTo<typeof Recipe>
}
