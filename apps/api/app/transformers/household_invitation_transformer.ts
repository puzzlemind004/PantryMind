import type HouseholdInvitation from '#models/household_invitation'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class HouseholdInvitationTransformer extends BaseTransformer<HouseholdInvitation> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'householdId',
      'code',
      'role',
      'expiresAt',
      'revokedAt',
      'createdAt',
    ])
  }
}
