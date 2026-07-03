/** Roles within a household, from most to least privileged (spec §4.2). */
export const HOUSEHOLD_ROLES = ['admin', 'member', 'viewer'] as const
export type HouseholdRole = (typeof HOUSEHOLD_ROLES)[number]

/** Physical storage area types (spec §4.6). */
export const STORAGE_LOCATION_TYPES = ['fridge', 'freezer', 'pantry', 'cellar', 'other'] as const
export type StorageLocationType = (typeof STORAGE_LOCATION_TYPES)[number]
