import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { StockMovementSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import StockItem from '#models/stock_item'
import User from '#models/user'
import type { StockMovementType } from '#types/stock'

/**
 * Append-only trace of every stock mutation (spec §5.1, §9.8).
 * Written exclusively by StockService, in the same transaction as the
 * mutation itself.
 */
export default class StockMovement extends withUuidPrimaryKey(StockMovementSchema) {
  declare type: StockMovementType
  declare context: Record<string, unknown>

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => StockItem)
  declare stockItem: BelongsTo<typeof StockItem>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
