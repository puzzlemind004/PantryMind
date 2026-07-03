import type Household from '#models/household'
import { BaseTransformer } from '@adonisjs/core/transformers'

import HouseholdMemberTransformer from '#transformers/household_member_transformer'
import MealTypeTransformer from '#transformers/meal_type_transformer'
import StorageLocationTransformer from '#transformers/storage_location_transformer'

export default class HouseholdTransformer extends BaseTransformer<Household> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'settings', 'createdAt', 'updatedAt']),
      members: HouseholdMemberTransformer.transform(this.whenLoaded(this.resource.members)),
      storageLocations: StorageLocationTransformer.transform(
        this.whenLoaded(this.resource.storageLocations)
      ),
      mealTypes: MealTypeTransformer.transform(this.whenLoaded(this.resource.mealTypes)),
    }
  }
}
