import type StockItem from '#models/stock_item'
import { BaseTransformer } from '@adonisjs/core/transformers'

import ProductReferenceTransformer from '#transformers/product_reference_transformer'
import ProductTransformer from '#transformers/product_transformer'
import StorageLocationTransformer from '#transformers/storage_location_transformer'

export default class StockItemTransformer extends BaseTransformer<StockItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'householdId',
        'productId',
        'productReferenceId',
        'quantity',
        'unit',
        'storageLocationId',
        'status',
        'addedAt',
        'version',
        'isExpired',
      ]),
      expiresAt: this.resource.expiresAt?.toISODate() ?? null,
      product: ProductTransformer.transform(this.whenLoaded(this.resource.product)),
      productReference: ProductReferenceTransformer.transform(
        this.whenLoaded(this.resource.productReference)
      ),
      storageLocation: StorageLocationTransformer.transform(
        this.whenLoaded(this.resource.storageLocation)
      ),
    }
  }
}
