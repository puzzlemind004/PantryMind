import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { MealTypeSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'

export default class MealType extends withUuidPrimaryKey(MealTypeSchema) {
  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>
}
