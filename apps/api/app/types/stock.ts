/** Lifecycle of a physical stock lot (spec §4.5 — no "reserved" status). */
export const STOCK_ITEM_STATUSES = ['available', 'consumed', 'discarded'] as const
export type StockItemStatus = (typeof STOCK_ITEM_STATUSES)[number]

/** Every stock mutation is traced with one of these movement types. */
export const STOCK_MOVEMENT_TYPES = [
  'added',
  'consumed',
  'discarded',
  'corrected',
  'moved',
  'purchased',
] as const
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number]

/** Why a lot left the stock without being eaten (spec 5.17). */
export const DISCARD_REASONS = ['trashed', 'lost', 'given'] as const
export type DiscardReason = (typeof DISCARD_REASONS)[number]
