import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

import { toDateTime } from '#helpers/dates'
import Product from '#models/product'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import StorageLocation from '#models/storage_location'
import StockService from '#services/stock_service'
import StockItemTransformer from '#transformers/stock_item_transformer'
import StockMovementTransformer from '#transformers/stock_movement_transformer'
import {
  addStockItemValidator,
  consumeStockItemValidator,
  correctStockItemValidator,
  discardStockItemValidator,
  freezeStockItemValidator,
  listStockValidator,
} from '#validators/stock'

export default class StockItemsController {
  /**
   * Real-time stock view with filters (spec §6.1): status, location,
   * product, text search, expiry horizon. Sorted by expiry first so
   * urgent lots surface (spec §8.3).
   */
  async index({ household, request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listStockValidator)

    const query = StockItem.query()
      .where('household_id', household.id)
      .where('status', filters.status ?? 'available')
      .preload('product')
      .preload('productReference')
      .preload('storageLocation')
      .orderByRaw('expires_at ASC NULLS LAST, added_at ASC')

    if (filters.storageLocationId) {
      query.where('storage_location_id', filters.storageLocationId)
    }
    if (filters.productId) {
      query.where('product_id', filters.productId)
    }
    if (filters.search) {
      query.whereHas('product', (productQuery) => {
        productQuery.whereILike('name', `%${filters.search}%`)
      })
    }
    if (filters.expiringWithinDays !== undefined) {
      query.whereNotNull('expires_at')
      query.where(
        'expires_at',
        '<=',
        DateTime.now().plus({ days: filters.expiringWithinDays }).toISODate()!
      )
    }

    return serialize(StockItemTransformer.transform(await query))
  }

  async store({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(addStockItemValidator)

    /** The product must be visible to this household (own or global). */
    const product = await Product.query()
      .where('id', payload.productId)
      .where((scope) => {
        scope.whereNull('household_id').orWhere('household_id', household.id)
      })
      .first()
    if (!product) {
      return response.unprocessableEntity({
        errors: [{ code: 'PRODUCT_NOT_FOUND', message: 'Unknown product for this household' }],
      })
    }

    if (payload.storageLocationId) {
      const location = await StorageLocation.query()
        .where('id', payload.storageLocationId)
        .where('household_id', household.id)
        .first()
      if (!location) {
        return response.unprocessableEntity({
          errors: [{ code: 'LOCATION_NOT_FOUND', message: 'Unknown storage location' }],
        })
      }
    }

    const item = await StockService.addItem(household, auth.getUserOrFail(), {
      ...payload,
      expiresAt: payload.expiresAt ? toDateTime(payload.expiresAt) : null,
    })
    await item.load('product')
    await item.load('storageLocation')

    response.status(201)
    return serialize(StockItemTransformer.transform(item))
  }

  async update({ household, params, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(correctStockItemValidator)

    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return response.notFound({
        errors: [{ code: 'STOCK_ITEM_NOT_FOUND', message: 'Stock item not found' }],
      })
    }

    if (payload.storageLocationId) {
      const location = await StorageLocation.query()
        .where('id', payload.storageLocationId)
        .where('household_id', household.id)
        .first()
      if (!location) {
        return response.unprocessableEntity({
          errors: [{ code: 'LOCATION_NOT_FOUND', message: 'Unknown storage location' }],
        })
      }
    }

    await StockService.correctItem(item, auth.getUserOrFail(), {
      quantity: payload.quantity,
      storageLocationId: payload.storageLocationId,
      expiresAt:
        payload.expiresAt === undefined
          ? undefined
          : payload.expiresAt && toDateTime(payload.expiresAt),
    })
    await item.load('product')
    await item.load('storageLocation')

    return serialize(StockItemTransformer.transform(item))
  }

  /** Quick action: mark (part of) a lot as eaten (spec §8.3). */
  async consume({ household, params, auth, request, response, serialize }: HttpContext) {
    const { quantity } = await request.validateUsing(consumeStockItemValidator)

    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return response.notFound({
        errors: [{ code: 'STOCK_ITEM_NOT_FOUND', message: 'Stock item not found' }],
      })
    }

    await StockService.consumeItem(item, auth.getUserOrFail(), quantity)

    return serialize(StockItemTransformer.transform(item))
  }

  /** Declares waste: trashed, lost or given (spec 5.17). */
  async discard({ household, params, auth, request, response, serialize }: HttpContext) {
    const { quantity, reason } = await request.validateUsing(discardStockItemValidator)

    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return response.notFound({
        errors: [{ code: 'STOCK_ITEM_NOT_FOUND', message: 'Stock item not found' }],
      })
    }

    await StockService.discardItem(item, auth.getUserOrFail(), quantity, reason)

    return serialize(StockItemTransformer.transform(item))
  }

  /**
   * Freezes a lot (spec 5.22): freezer location required — provided or
   * defaulted to the household's first freezer.
   */
  async freeze({ household, params, auth, request, response, serialize }: HttpContext) {
    const { storageLocationId } = await request.validateUsing(freezeStockItemValidator)

    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return response.notFound({
        errors: [{ code: 'STOCK_ITEM_NOT_FOUND', message: 'Stock item not found' }],
      })
    }

    const freezerQuery = StorageLocation.query()
      .where('household_id', household.id)
      .where('type', 'freezer')
    if (storageLocationId) {
      freezerQuery.where('id', storageLocationId)
    }
    const freezer = await freezerQuery.orderBy('position').first()
    if (!freezer) {
      return response.unprocessableEntity({
        errors: [
          {
            code: 'NO_FREEZER',
            message: 'Aucun emplacement de type congélateur dans ce foyer',
          },
        ],
      })
    }

    await StockService.freezeItem(item, auth.getUserOrFail(), freezer.id)
    await item.load('product')
    await item.load('storageLocation')

    return serialize(StockItemTransformer.transform(item))
  }

  /** Movement history of one lot (spec §4.12). */
  async movements({ household, params, response, serialize }: HttpContext) {
    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return response.notFound({
        errors: [{ code: 'STOCK_ITEM_NOT_FOUND', message: 'Stock item not found' }],
      })
    }

    const movements = await StockMovement.query()
      .where('stock_item_id', item.id)
      .orderBy('created_at', 'desc')

    return serialize(StockMovementTransformer.transform(movements))
  }

  private findItem(householdId: string, itemId: string) {
    return StockItem.query().where('household_id', householdId).where('id', itemId).first()
  }
}
