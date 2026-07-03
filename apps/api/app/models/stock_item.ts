import { DateTime } from 'luxon'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { StockItemSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import Product from '#models/product'
import ProductReference from '#models/product_reference'
import StockMovement from '#models/stock_movement'
import StorageLocation from '#models/storage_location'
import type { StockItemStatus } from '#types/stock'

/**
 * One physical lot in the household stock (spec §4.5). Lots are never
 * aggregated so that expiry dates, FIFO and traceability work per unit.
 */
export default class StockItem extends withUuidPrimaryKey(StockItemSchema) {
  declare status: StockItemStatus

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductReference)
  declare productReference: BelongsTo<typeof ProductReference>

  @belongsTo(() => StorageLocation)
  declare storageLocation: BelongsTo<typeof StorageLocation>

  @hasMany(() => StockMovement)
  declare movements: HasMany<typeof StockMovement>

  /** Expired lots stay in stock but are flagged (spec 7.7). */
  get isExpired() {
    return this.expiresAt !== null && this.expiresAt < DateTime.now().startOf('day')
  }
}
