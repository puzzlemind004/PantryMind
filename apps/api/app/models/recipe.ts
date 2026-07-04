import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { RecipeSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import RecipeIngredient from '#models/recipe_ingredient'

/**
 * Culinary preparation template (spec §4.7): never impacts the stock by
 * itself (spec 5.7). Household-owned; sharing across households means
 * copying (spec 7.17). Soft-deleted to preserve history (spec 7.16).
 */
export default class Recipe extends withUuidPrimaryKey(RecipeSchema) {
  declare steps: string[]
  declare tags: string[]

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @hasMany(() => RecipeIngredient)
  declare ingredients: HasMany<typeof RecipeIngredient>
}
