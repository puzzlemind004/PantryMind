import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { ProductReferenceSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Product from '#models/product'
import type { NutritionPer100, ProductReferenceSource } from '#types/catalog'

/**
 * Commercial reference: a concrete product bought in a shop, identified
 * by its barcode (spec §4.4). Several references can point to the same
 * generic product.
 */
export default class ProductReference extends withUuidPrimaryKey(ProductReferenceSchema) {
  declare nutritionPer100: NutritionPer100 | null
  declare source: ProductReferenceSource

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
