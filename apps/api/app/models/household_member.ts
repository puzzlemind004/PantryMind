import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { HouseholdMemberSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import User from '#models/user'
import type { HouseholdRole } from '#types/household'

export default class HouseholdMember extends withUuidPrimaryKey(HouseholdMemberSchema) {
  declare role: HouseholdRole

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
