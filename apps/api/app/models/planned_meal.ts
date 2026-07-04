import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { PlannedMealSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import MealType from '#models/meal_type'
import PlannedMealRecipe from '#models/planned_meal_recipe'
import type { PlannedMealStatus } from '#types/planning'

/**
 * A meal at a given date (spec §4.10). Never touches the stock while
 * "planned" (spec 5.1) — only its validation as "done" consumes lots.
 */
export default class PlannedMeal extends withUuidPrimaryKey(PlannedMealSchema) {
  declare status: PlannedMealStatus

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => MealType)
  declare mealType: BelongsTo<typeof MealType>

  @hasMany(() => PlannedMealRecipe)
  declare recipes: HasMany<typeof PlannedMealRecipe>

  /** Effective time: explicit override, else the meal type default (spec §4.10). */
  get effectiveTime(): string | null {
    const time = this.timeOverride ?? this.mealType?.defaultTime ?? null
    return time ? time.slice(0, 5) : null
  }
}
