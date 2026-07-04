import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { ProductThresholdSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import Product from '#models/product'

/** Auto-replenishment threshold (spec 5.16). */
export default class ProductThreshold extends withUuidPrimaryKey(ProductThresholdSchema) {
  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
