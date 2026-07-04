import type Product from '#models/product'
import type RecipeIngredient from '#models/recipe_ingredient'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Compact product summary as a plain object: transformers nested three
 * levels deep (Item → Collection → Item) are not resolved by the
 * serializer, and the recipe context only needs these fields anyway.
 */
function productSummary(product: Product | undefined) {
  if (!product) {
    return undefined
  }
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    defaultUnit: product.defaultUnit,
    unitWeightGrams: product.unitWeightGrams,
    densityGPerMl: product.densityGPerMl,
  }
}

export default class RecipeIngredientTransformer extends BaseTransformer<RecipeIngredient> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'productId',
        'quantity',
        'unit',
        'optional',
        'note',
        'position',
      ]),
      product: productSummary(this.resource.product),
      substitutes: this.resource.substitutes?.map((substitute) => ({
        productId: substitute.productId,
        product: productSummary(substitute.product),
      })),
    }
  }
}
