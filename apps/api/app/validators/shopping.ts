import vine from '@vinejs/vine'

import { UNIT_CODES } from '#services/unit_service'

export const upsertThresholdValidator = vine.create({
  productId: vine.string().uuid(),
  minQuantity: vine.number().positive(),
  unit: vine.enum(UNIT_CODES),
})

export const generateShoppingListValidator = vine.create({
  /** Planning horizon in days (spec 5.13: recettes planifiées). */
  days: vine.number().min(1).max(30).optional(),
})

export const addShoppingItemValidator = vine.create({
  productId: vine.string().uuid(),
  quantity: vine.number().positive(),
  unit: vine.enum(UNIT_CODES),
})

export const updateShoppingItemValidator = vine.create({
  quantity: vine.number().positive(),
})

export const checkShoppingItemValidator = vine.create({
  storageLocationId: vine.string().uuid().nullable().optional(),
  expiresAt: vine.date().nullable().optional(),
})
