import vine from '@vinejs/vine'

import { UNIT_CODES } from '#services/unit_service'
import { DISCARD_REASONS, STOCK_ITEM_STATUSES } from '#types/stock'

export const listStockValidator = vine.create({
  status: vine.enum(STOCK_ITEM_STATUSES).optional(),
  storageLocationId: vine.string().uuid().optional(),
  productId: vine.string().uuid().optional(),
  search: vine.string().trim().maxLength(100).optional(),
  /** Only lots expiring within N days (includes already expired ones). */
  expiringWithinDays: vine.number().min(0).max(365).optional(),
})

export const addStockItemValidator = vine.create({
  productId: vine.string().uuid(),
  productReferenceId: vine.string().uuid().nullable().optional(),
  quantity: vine.number().positive(),
  unit: vine.enum(UNIT_CODES),
  storageLocationId: vine.string().uuid().nullable().optional(),
  expiresAt: vine.date().nullable().optional(),
  /** True when the addition comes from validated shopping (spec §6.5). */
  purchased: vine.boolean().optional(),
})

export const correctStockItemValidator = vine.create({
  quantity: vine.number().min(0).optional(),
  storageLocationId: vine.string().uuid().nullable().optional(),
  expiresAt: vine.date().nullable().optional(),
})

export const consumeStockItemValidator = vine.create({
  quantity: vine.number().positive().optional(),
})

export const discardStockItemValidator = vine.create({
  quantity: vine.number().positive().optional(),
  reason: vine.enum(DISCARD_REASONS).optional(),
})

export const freezeStockItemValidator = vine.create({
  /** Congélateur cible ; défaut : premier emplacement de type freezer du foyer. */
  storageLocationId: vine.string().uuid().optional(),
})
