import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'

import PlannedMeal from '#models/planned_meal'
import Product from '#models/product'
import ProductThreshold from '#models/product_threshold'
import ShoppingList from '#models/shopping_list'
import ShoppingListItem from '#models/shopping_list_item'
import ActivityLogService from '#services/activity_log_service'
import StockAvailabilityService from '#services/stock_availability_service'
import StockService from '#services/stock_service'
import UnitService from '#services/unit_service'
import type Household from '#models/household'
import type User from '#models/user'

/** A computed purchase need before packaging. */
interface ComputedNeed {
  productId: string
  productName: string
  quantity: number
  unit: string
  source: 'planning' | 'min_stock'
}

export default class ShoppingService {
  /** The household's single active list, created on first access. */
  static async activeList(household: Household): Promise<ShoppingList> {
    const existing = await ShoppingList.query()
      .where('household_id', household.id)
      .where('status', 'active')
      .first()
    if (existing) {
      return existing
    }
    return ShoppingList.create({ householdId: household.id, status: 'active', version: 1 })
  }

  static async loadItems(list: ShoppingList) {
    await list.load('items', (query) =>
      query.preload('productReference').orderByRaw('checked_at ASC NULLS FIRST, product_name ASC')
    )
    return list
  }

  /**
   * Regenerates the computed items of the active list (spec 5.13):
   * planned-meal needs minus stock, plus threshold deficits (5.16),
   * merged with unit conversions (5.14) and rounded up to commercial
   * packages (5.15). Manual and already-checked items are preserved —
   * the list stays recomputable at any time without losing user input.
   */
  static async generate(household: Household, user: User, options: { days?: number } = {}) {
    const days = options.days ?? 7
    const list = await this.activeList(household)

    const needs = await this.computeNeeds(household, days)

    await db.transaction(async (trx) => {
      list.useTransaction(trx)

      /** Non-destructive regeneration: computed & unchecked items only. */
      await ShoppingListItem.query({ client: trx })
        .where('shopping_list_id', list.id)
        .whereNull('checked_at')
        .whereNot('source', 'manual')
        .delete()

      for (const need of needs) {
        const packaging = await this.suggestPackaging(need)
        await ShoppingListItem.create(
          {
            shoppingListId: list.id,
            productId: need.productId,
            productName: need.productName,
            neededQuantity: need.quantity,
            unit: need.unit,
            productReferenceId: packaging?.referenceId ?? null,
            packageCount: packaging?.count ?? null,
            source: need.source,
          },
          { client: trx }
        )
      }

      list.generatedAt = DateTime.now()
      list.version += 1
      await list.save()

      await ActivityLogService.record({
        householdId: household.id,
        userId: user.id,
        action: 'shopping_list.generated',
        subjectType: 'shopping_list',
        subjectId: list.id,
        data: { items: needs.length, horizonDays: days },
        trx,
      })
    })

    return this.loadItems(list)
  }

  static async addManualItem(
    list: ShoppingList,
    household: Household,
    payload: { productId: string; quantity: number; unit: string }
  ) {
    const product = await Product.query()
      .where('id', payload.productId)
      .where((scope) => {
        scope.whereNull('household_id').orWhere('household_id', household.id)
      })
      .first()
    if (!product) {
      throw new Exception('Produit inconnu pour ce foyer', {
        status: 422,
        code: 'PRODUCT_NOT_FOUND',
      })
    }

    const packaging = await this.suggestPackaging({
      productId: product.id,
      productName: product.name,
      quantity: payload.quantity,
      unit: payload.unit,
      source: 'planning',
    })

    return ShoppingListItem.create({
      shoppingListId: list.id,
      productId: product.id,
      productName: product.name,
      neededQuantity: payload.quantity,
      unit: payload.unit,
      productReferenceId: packaging?.referenceId ?? null,
      packageCount: packaging?.count ?? null,
      source: 'manual',
    })
  }

  /**
   * Checking an article in the shop adds it to the stock (spec §8.9).
   * The purchased quantity is the full packaging when one is suggested —
   * the surplus naturally enters the stock (spec 7.12).
   */
  static async checkItem(
    item: ShoppingListItem,
    household: Household,
    user: User,
    options: { storageLocationId?: string | null; expiresAt?: DateTime | null } = {}
  ) {
    if (item.checkedAt) {
      return item
    }

    await item.load('productReference')
    const reference = item.productReference

    const purchased =
      reference?.packageQuantity && reference.packageUnit && item.packageCount
        ? { quantity: reference.packageQuantity * item.packageCount, unit: reference.packageUnit }
        : { quantity: item.neededQuantity, unit: item.unit }

    const stockItem = await StockService.addItem(household, user, {
      productId: item.productId,
      productReferenceId: item.productReferenceId,
      quantity: purchased.quantity,
      unit: purchased.unit,
      storageLocationId: options.storageLocationId ?? null,
      expiresAt: options.expiresAt ?? null,
      purchased: true,
    })

    item.checkedAt = DateTime.now()
    item.checkedBy = user.id
    item.stockItemId = stockItem.id
    await item.save()
    return item
  }

  /**
   * Unchecking reverts the stock entry only when the created lot is
   * still untouched (spec §8.14: actions are undoable) — otherwise the
   * stock is left as-is and only the checkbox state changes.
   */
  static async uncheckItem(item: ShoppingListItem) {
    if (!item.checkedAt) {
      return item
    }

    if (item.stockItemId) {
      const stockItem = await item.related('stockItem').query().first()
      if (stockItem && stockItem.status === 'available' && stockItem.version === 1) {
        await stockItem.delete()
      }
    }

    item.checkedAt = null
    item.checkedBy = null
    item.stockItemId = null
    await item.save()
    return item
  }

  /** Needs = planning deficit + threshold top-up (5.13, 5.16). */
  private static async computeNeeds(household: Household, days: number): Promise<ComputedNeed[]> {
    const from = DateTime.now().toISODate()
    const to = DateTime.now().plus({ days }).toISODate()

    const meals = await PlannedMeal.query()
      .where('household_id', household.id)
      .where('status', 'planned')
      .whereBetween('date', [from, to])
      .preload('recipes')

    /** Aggregate snapshot needs; optional ingredients are never bought. */
    const required: {
      productId: string
      productName: string
      quantity: number
      unit: string
    }[] = []
    for (const meal of meals) {
      for (const mealRecipe of meal.recipes) {
        const ratio = mealRecipe.servings / mealRecipe.snapshot.baseServings
        for (const ingredient of mealRecipe.snapshot.ingredients) {
          if (ingredient.optional) {
            continue
          }
          const quantity = Number((ingredient.quantity * ratio).toFixed(3))
          const existing = required.find(
            (entry) =>
              entry.productId === ingredient.productId &&
              UnitService.convert(1, ingredient.unit, entry.unit) !== null
          )
          if (existing) {
            existing.quantity = Number(
              (
                existing.quantity + UnitService.convert(quantity, ingredient.unit, existing.unit)!
              ).toFixed(3)
            )
          } else {
            required.push({
              productId: ingredient.productId,
              productName: ingredient.productName,
              quantity,
              unit: ingredient.unit,
            })
          }
        }
      }
    }

    const thresholds = await ProductThreshold.query()
      .where('household_id', household.id)
      .preload('product')

    const availability = await StockAvailabilityService.availabilityFor(household.id, [
      ...required.map((entry) => ({ productId: entry.productId, unit: entry.unit })),
      ...thresholds.map((threshold) => ({
        productId: threshold.productId,
        unit: threshold.unit,
      })),
    ])

    const needs: ComputedNeed[] = []

    for (const entry of required) {
      const available = availability.get(entry.productId) ?? 0
      const deficit = Number((entry.quantity - available).toFixed(3))
      if (deficit > 0) {
        needs.push({ ...entry, quantity: deficit, source: 'planning' })
      }
    }

    /**
     * Threshold top-up (5.16): after the planning is cooked, the stock
     * should still hold at least min_quantity.
     */
    for (const threshold of thresholds) {
      const available = availability.get(threshold.productId) ?? 0
      const plannedNeed = required.find((entry) => entry.productId === threshold.productId)
      const plannedInThresholdUnit = plannedNeed
        ? (UnitService.convert(plannedNeed.quantity, plannedNeed.unit, threshold.unit, {
            unitWeightGrams: threshold.product.unitWeightGrams,
            densityGPerMl: threshold.product.densityGPerMl,
          }) ?? 0)
        : 0
      const leftoverAfterPlanning = Math.max(available - plannedInThresholdUnit, 0)
      const deficit = Number((threshold.minQuantity - leftoverAfterPlanning).toFixed(3))
      if (deficit <= 0) {
        continue
      }

      const existing = needs.find(
        (need) =>
          need.productId === threshold.productId &&
          UnitService.convert(1, threshold.unit, need.unit) !== null
      )
      if (existing) {
        existing.quantity = Number(
          (
            existing.quantity + UnitService.convert(deficit, threshold.unit, existing.unit)!
          ).toFixed(3)
        )
      } else {
        needs.push({
          productId: threshold.productId,
          productName: threshold.product.name,
          quantity: deficit,
          unit: threshold.unit,
          source: 'min_stock',
        })
      }
    }

    return needs
  }

  /**
   * Commercial packaging (5.15): among the product references carrying
   * package data convertible into the need's unit, pick the one leaving
   * the smallest surplus (ties: fewest packages).
   */
  private static async suggestPackaging(
    need: ComputedNeed
  ): Promise<{ referenceId: string; count: number } | null> {
    const product = await Product.query().where('id', need.productId).preload('references').first()
    if (!product) {
      return null
    }

    let best: { referenceId: string; count: number; surplus: number } | null = null
    for (const reference of product.references) {
      if (!reference.packageQuantity || !reference.packageUnit) {
        continue
      }
      const packageInNeedUnit = UnitService.convert(
        reference.packageQuantity,
        reference.packageUnit,
        need.unit,
        { unitWeightGrams: product.unitWeightGrams, densityGPerMl: product.densityGPerMl }
      )
      if (!packageInNeedUnit || packageInNeedUnit <= 0) {
        continue
      }
      const count = Math.ceil(need.quantity / packageInNeedUnit)
      const surplus = Number((count * packageInNeedUnit - need.quantity).toFixed(3))
      if (!best || surplus < best.surplus || (surplus === best.surplus && count < best.count)) {
        best = { referenceId: reference.id, count, surplus }
      }
    }

    return best ? { referenceId: best.referenceId, count: best.count } : null
  }
}
