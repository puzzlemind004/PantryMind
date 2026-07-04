import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { IngredientSubstituteSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Product from '#models/product'
import RecipeIngredient from '#models/recipe_ingredient'

/** Possible replacement product for an ingredient (spec 5.8). */
export default class IngredientSubstitute extends withUuidPrimaryKey(IngredientSubstituteSchema) {
  @belongsTo(() => RecipeIngredient)
  declare recipeIngredient: BelongsTo<typeof RecipeIngredient>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
