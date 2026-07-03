import type HouseholdMember from '#models/household_member'
import { BaseTransformer } from '@adonisjs/core/transformers'

import HouseholdTransformer from '#transformers/household_transformer'

/**
 * The authenticated user's view of one of their households:
 * the household itself plus their own role in it.
 */
export default class HouseholdMembershipTransformer extends BaseTransformer<HouseholdMember> {
  toObject() {
    return {
      role: this.resource.role,
      household: HouseholdTransformer.transform(this.whenLoaded(this.resource.household)),
    }
  }
}
