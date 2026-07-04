import type Household from '#models/household'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Nested collections are serialized as plain objects: transformers
 * nested three levels deep (Item → Item → Collection) are not resolved
 * by the serializer — the keys silently disappear (user-facing bug:
 * empty storage locations and meal types on the profile and planning
 * screens, 2026-07-04).
 */
export default class HouseholdTransformer extends BaseTransformer<Household> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'settings', 'createdAt', 'updatedAt']),
      members: this.resource.members?.map((member) => ({
        id: member.id,
        householdId: member.householdId,
        role: member.role,
        createdAt: member.createdAt,
        user: member.user
          ? {
              id: member.user.id,
              fullName: member.user.fullName,
              email: member.user.email,
              initials: member.user.initials,
            }
          : undefined,
      })),
      storageLocations: this.resource.storageLocations?.map((location) => ({
        id: location.id,
        householdId: location.householdId,
        name: location.name,
        type: location.type,
        description: location.description,
        position: location.position,
      })),
      mealTypes: this.resource.mealTypes?.map((mealType) => ({
        id: mealType.id,
        householdId: mealType.householdId,
        name: mealType.name,
        defaultTime: mealType.defaultTime?.slice(0, 5) ?? null,
        position: mealType.position,
      })),
    }
  }
}
