import type HouseholdMember from '#models/household_member'
import { BaseTransformer } from '@adonisjs/core/transformers'

import UserTransformer from '#transformers/user_transformer'

export default class HouseholdMemberTransformer extends BaseTransformer<HouseholdMember> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'householdId', 'role', 'createdAt']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }
}
