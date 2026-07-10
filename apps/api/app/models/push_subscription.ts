import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { PushSubscriptionSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import User from '#models/user'

/** Web Push subscription of one user's device for one household (spec §6.6). */
export default class PushSubscription extends withUuidPrimaryKey(PushSubscriptionSchema) {
  /** Nom explicite : la stratégie de nommage transformerait p256Dh en p_256_dh. */
  @column({ columnName: 'p256dh' })
  declare p256Dh: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>
}
