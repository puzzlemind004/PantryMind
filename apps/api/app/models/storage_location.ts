import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { StorageLocationSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import type { StorageLocationType } from '#types/household'

export default class StorageLocation extends withUuidPrimaryKey(StorageLocationSchema) {
  declare type: StorageLocationType

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>
}
