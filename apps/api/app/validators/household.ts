import vine from '@vinejs/vine'

import { HOUSEHOLD_ROLES, STORAGE_LOCATION_TYPES } from '#types/household'

/** Time in "HH:mm" 24h format. */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export const createHouseholdValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
})

export const updateHouseholdValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100).optional(),
  settings: vine
    .object({
      automaticMode: vine.boolean().optional(),
    })
    .optional(),
})

export const createInvitationValidator = vine.create({
  role: vine.enum(HOUSEHOLD_ROLES).optional(),
})

export const joinHouseholdValidator = vine.create({
  code: vine.string().trim().minLength(4).maxLength(32),
})

export const updateMemberValidator = vine.create({
  role: vine.enum(HOUSEHOLD_ROLES),
})

export const storageLocationValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
  type: vine.enum(STORAGE_LOCATION_TYPES).optional(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
  position: vine.number().min(0).optional(),
})

export const updateStorageLocationValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100).optional(),
  type: vine.enum(STORAGE_LOCATION_TYPES).optional(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
  position: vine.number().min(0).optional(),
})

export const mealTypeValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
  defaultTime: vine.string().regex(TIME_PATTERN),
  position: vine.number().min(0).optional(),
})

export const updateMealTypeValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100).optional(),
  defaultTime: vine.string().regex(TIME_PATTERN).optional(),
  position: vine.number().min(0).optional(),
})
