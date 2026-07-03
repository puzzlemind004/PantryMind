import type Product from '#models/product'
import { BaseTransformer } from '@adonisjs/core/transformers'

import ProductReferenceTransformer from '#transformers/product_reference_transformer'

export default class ProductTransformer extends BaseTransformer<Product> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'category',
        'defaultUnit',
        'unitWeightGrams',
        'densityGPerMl',
        'nutritionPer100',
        'allergens',
        'isGlobal',
      ]),
      references: ProductReferenceTransformer.transform(this.whenLoaded(this.resource.references)),
    }
  }
}
