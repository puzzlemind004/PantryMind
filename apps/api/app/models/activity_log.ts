import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { ActivityLogSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import User from '#models/user'

/**
 * Append-only journal of significant user actions (spec §4.12).
 * Stock mutations have their own dedicated trail (stock_movements).
 */
export default class ActivityLog extends withUuidPrimaryKey(ActivityLogSchema) {
  declare data: Record<string, unknown>

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
