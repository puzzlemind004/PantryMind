import type ProductReference from '#models/product_reference'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ProductReferenceTransformer extends BaseTransformer<ProductReference> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'productId',
      'barcode',
      'brand',
      'name',
      'packageQuantity',
      'packageUnit',
      'nutritionPer100',
      'imageUrl',
      'shelfLifeDays',
      'source',
    ])
  }
}
