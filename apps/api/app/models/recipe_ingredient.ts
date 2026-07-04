import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { RecipeIngredientSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import IngredientSubstitute from '#models/ingredient_substitute'
import Product from '#models/product'
import Recipe from '#models/recipe'

/** Relation between a recipe and a generic product (spec §4.8). */
export default class RecipeIngredient extends withUuidPrimaryKey(RecipeIngredientSchema) {
  @belongsTo(() => Recipe)
  declare recipe: BelongsTo<typeof Recipe>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @hasMany(() => IngredientSubstitute)
  declare substitutes: HasMany<typeof IngredientSubstitute>
}
