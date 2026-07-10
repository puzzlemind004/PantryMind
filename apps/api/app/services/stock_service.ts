import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import Product from '#models/product'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import UnitService from '#services/unit_service'
import type Household from '#models/household'
import type User from '#models/user'
import type { DiscardReason, StockMovementType } from '#types/stock'

/**
 * Single writing point for the household stock
 * (docs/architecture.md §4.4): every mutation goes through this service,
 * inside a transaction that also writes the stock movement.
 *
 * The planning module never calls this service before a meal is
 * validated as done (spec §5.1).
 */
export default class StockService {
  /** Adds a physical lot to the stock (spec §6.1). */
  static async addItem(
    household: Household,
    user: User,
    payload: {
      productId: string
      productReferenceId?: string | null
      quantity: number
      unit: string
      storageLocationId?: string | null
      expiresAt?: DateTime | null
      purchased?: boolean
    }
  ) {
    return db.transaction(async (trx) => {
      const item = await StockItem.create(
        {
          householdId: household.id,
          productId: payload.productId,
          productReferenceId: payload.productReferenceId ?? null,
          quantity: payload.quantity,
          unit: payload.unit,
          storageLocationId: payload.storageLocationId ?? null,
          status: 'available',
          addedAt: DateTime.now(),
          expiresAt: payload.expiresAt ?? null,
          version: 1,
        },
        { client: trx }
      )

      await this.recordMovement(trx, item, user, payload.purchased ? 'purchased' : 'added', {
        quantityDelta: payload.quantity,
      })

      return item
    })
  }

  /**
   * Manual correction of a lot (spec §5.18, §6.1): quantity, expiry date
   * or storage location. Every change is traced.
   */
  static async correctItem(
    item: StockItem,
    user: User,
    payload: {
      quantity?: number
      expiresAt?: DateTime | null
      storageLocationId?: string | null
    }
  ) {
    return db.transaction(async (trx) => {
      item.useTransaction(trx)

      if (
        payload.storageLocationId !== undefined &&
        payload.storageLocationId !== item.storageLocationId
      ) {
        const previousLocationId = item.storageLocationId
        item.storageLocationId = payload.storageLocationId
        await this.recordMovement(trx, item, user, 'moved', {
          context: { previousLocationId, newLocationId: payload.storageLocationId },
        })
      }

      const corrections: Record<string, unknown> = {}

      if (payload.quantity !== undefined && payload.quantity !== item.quantity) {
        corrections.previousQuantity = item.quantity
        corrections.newQuantity = payload.quantity
        await this.recordMovement(trx, item, user, 'corrected', {
          quantityDelta: payload.quantity - item.quantity,
          context: corrections,
        })
        item.quantity = payload.quantity
        if (payload.quantity > 0 && item.status !== 'available') {
          /** A positive correction can bring a lot back (spec 7.6). */
          item.status = 'available'
        }
      }

      if (payload.expiresAt !== undefined) {
        const previous = item.expiresAt?.toISODate() ?? null
        const next = payload.expiresAt?.toISODate() ?? null
        if (previous !== next) {
          await this.recordMovement(trx, item, user, 'corrected', {
            context: { previousExpiresAt: previous, newExpiresAt: next },
          })
          item.expiresAt = payload.expiresAt
        }
      }

      item.version += 1
      await item.save()
      return item
    })
  }

  /** Declares a partial or total consumption of a lot (spec §6.1). */
  static async consumeItem(item: StockItem, user: User, quantity?: number) {
    return this.decrementItem(item, user, 'consumed', quantity)
  }

  /** Declares a lot trashed / lost / given (spec 5.17). */
  static async discardItem(item: StockItem, user: User, quantity?: number, reason?: DiscardReason) {
    return this.decrementItem(item, user, 'discarded', quantity, { reason: reason ?? 'trashed' })
  }

  /**
   * FIFO consumption of a product across lots (spec 5.5): oldest lots
   * first (closest expiry date, then entry date). Converts units through
   * the product factors when needed. Returns the consumed lots and the
   * missing remainder, without ever failing the whole operation
   * (spec 7.5: the user is never fully blocked).
   */
  static async consumeProductFifo(
    household: Household,
    user: User | null,
    payload: {
      productId: string
      quantity: number
      unit: string
      context?: Record<string, unknown>
    }
  ): Promise<{ consumed: { item: StockItem; quantity: number }[]; missingQuantity: number }> {
    const product = await Product.findOrFail(payload.productId)

    return db.transaction(async (trx) => {
      const lots = await StockItem.query({ client: trx })
        .where('household_id', household.id)
        .where('product_id', payload.productId)
        .where('status', 'available')
        .orderByRaw('expires_at ASC NULLS LAST, added_at ASC')
        .forUpdate()

      let remaining = payload.quantity
      const consumed: { item: StockItem; quantity: number }[] = []

      for (const lot of lots) {
        if (remaining <= 0) {
          break
        }

        /** Convert the request into the lot's own unit. */
        const remainingInLotUnit = UnitService.convert(remaining, payload.unit, lot.unit, {
          unitWeightGrams: product.unitWeightGrams,
          densityGPerMl: product.densityGPerMl,
        })
        if (remainingInLotUnit === null) {
          throw new Exception(
            `Conversion impossible de "${payload.unit}" vers "${lot.unit}" pour ${product.name}`,
            { status: 422, code: 'UNIT_CONVERSION_IMPOSSIBLE' }
          )
        }

        const taken = Math.min(lot.quantity, remainingInLotUnit)
        lot.useTransaction(trx)
        lot.quantity = Number((lot.quantity - taken).toFixed(3))
        if (lot.quantity <= 0) {
          lot.quantity = 0
          lot.status = 'consumed'
        }
        lot.version += 1
        await lot.save()

        await this.recordMovement(trx, lot, user, 'consumed', {
          quantityDelta: -taken,
          context: payload.context,
        })

        consumed.push({ item: lot, quantity: taken })

        const takenInRequestUnit = UnitService.convert(taken, lot.unit, payload.unit, {
          unitWeightGrams: product.unitWeightGrams,
          densityGPerMl: product.densityGPerMl,
        })
        remaining = Number((remaining - (takenInRequestUnit ?? 0)).toFixed(3))
      }

      return { consumed, missingQuantity: Math.max(remaining, 0) }
    })
  }

  private static async decrementItem(
    item: StockItem,
    user: User,
    type: Extract<StockMovementType, 'consumed' | 'discarded'>,
    quantity?: number,
    context?: Record<string, unknown>
  ) {
    const taken = quantity === undefined ? item.quantity : Math.min(quantity, item.quantity)

    return db.transaction(async (trx) => {
      item.useTransaction(trx)
      item.quantity = Number((item.quantity - taken).toFixed(3))
      if (item.quantity <= 0) {
        item.quantity = 0
        item.status = type
      }
      item.version += 1
      await item.save()

      await this.recordMovement(trx, item, user, type, { quantityDelta: -taken, context })

      return item
    })
  }

  private static async recordMovement(
    trx: TransactionClientContract,
    item: StockItem,
    user: User | null,
    type: StockMovementType,
    options: { quantityDelta?: number; context?: Record<string, unknown> } = {}
  ) {
    return StockMovement.create(
      {
        householdId: item.householdId,
        stockItemId: item.id,
        userId: user?.id ?? null,
        type,
        quantityDelta: options.quantityDelta ?? 0,
        unit: item.unit,
        context: options.context ?? {},
      },
      { client: trx }
    )
  }
}
