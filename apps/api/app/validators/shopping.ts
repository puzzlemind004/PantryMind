import vine from '@vinejs/vine'

import { UNIT_CODES } from '#services/unit_service'

export const upsertThresholdValidator = vine.create({
  productId: vine.string().uuid(),
  minQuantity: vine.number().positive(),
  unit: vine.enum(UNIT_CODES),
})

export const generateShoppingListValidator = vine.create({
  /** Fenêtre de courses (spec 5.24) : défauts aujourd'hui → +7 jours. */
  shoppingDate: vine.date().optional(),
  nextShoppingDate: vine.date().optional(),
})

export const addShoppingItemValidator = vine.create({
  productId: vine.string().uuid(),
  quantity: vine.number().positive(),
  unit: vine.enum(UNIT_CODES),
})

export const updateShoppingItemValidator = vine.create({
  quantity: vine.number().positive(),
})

export const scanShoppingValidator = vine.create({
  barcode: vine.string().trim().minLength(4).maxLength(32),
})

export const checkShoppingItemValidator = vine.create({
  storageLocationId: vine.string().uuid().nullable().optional(),
  expiresAt: vine.date().nullable().optional(),
})
