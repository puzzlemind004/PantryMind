import { DateTime } from 'luxon'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { HouseholdInvitationSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import User from '#models/user'
import type { HouseholdRole } from '#types/household'

export default class HouseholdInvitation extends withUuidPrimaryKey(HouseholdInvitationSchema) {
  declare role: HouseholdRole

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare inviter: BelongsTo<typeof User>

  get isUsable() {
    return this.revokedAt === null && this.expiresAt > DateTime.now()
  }
}
