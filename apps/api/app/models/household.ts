import { hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

import { HouseholdSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import HouseholdInvitation from '#models/household_invitation'
import HouseholdMember from '#models/household_member'
import MealType from '#models/meal_type'
import StorageLocation from '#models/storage_location'
import User from '#models/user'

export interface HouseholdSettings {
  /** Automatic consumption validation (spec 5.20). */
  automaticMode?: boolean
  /** Marker: expiry digest already sent that day (scheduler idempotence). */
  lastExpiryAlertDate?: string
}

export default class Household extends withUuidPrimaryKey(HouseholdSchema) {
  declare settings: HouseholdSettings

  @hasMany(() => HouseholdMember)
  declare members: HasMany<typeof HouseholdMember>

  @manyToMany(() => User, { pivotTable: 'household_members', pivotColumns: ['role'] })
  declare users: ManyToMany<typeof User>

  @hasMany(() => HouseholdInvitation)
  declare invitations: HasMany<typeof HouseholdInvitation>

  @hasMany(() => StorageLocation)
  declare storageLocations: HasMany<typeof StorageLocation>

  @hasMany(() => MealType)
  declare mealTypes: HasMany<typeof MealType>
}
