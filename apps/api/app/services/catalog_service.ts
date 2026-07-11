import db from '@adonisjs/lucid/services/db'

import Product from '#models/product'
import ProductReference from '#models/product_reference'
import OpenFoodFactsService from '#services/open_food_facts_service'
import type Household from '#models/household'
import type { ExternalProductData } from '#services/open_food_facts_service'

export type BarcodeLookupResult =
  | { status: 'local'; reference: ProductReference }
  | { status: 'external'; external: ExternalProductData }
  | { status: 'unknown' }

export default class CatalogService {
  /**
   * Searches products visible to a household: its own products plus the
   * global catalogue (spec §6.2).
   */
  static searchQuery(household: Household, search?: string, kind?: string) {
    const query = Product.query()
      .where((scope) => {
        scope.whereNull('household_id').orWhere('household_id', household.id)
      })
      .orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }
    /** e.g. the recipe ingredient picker only sees food (spec 5.21). */
    if (kind) {
      query.where('kind', kind)
    }

    return query
  }

  /** Creates a household-owned generic product (spec §6.2). */
  static async createProduct(
    household: Household,
    payload: {
      name: string
      kind?: Product['kind']
      category?: string | null
      defaultUnit?: string
      unitWeightGrams?: number | null
      densityGPerMl?: number | null
      freezeShelfLifeDays?: number | null
      nutritionPer100?: Product['nutritionPer100']
      allergens?: string[]
    }
  ) {
    return Product.create({
      householdId: household.id,
      name: payload.name,
      kind: payload.kind ?? 'food',
      category: payload.category ?? null,
      defaultUnit: payload.defaultUnit ?? 'g',
      unitWeightGrams: payload.unitWeightGrams ?? null,
      densityGPerMl: payload.densityGPerMl ?? null,
      freezeShelfLifeDays: payload.freezeShelfLifeDays ?? null,
      nutritionPer100: payload.nutritionPer100 ?? null,
      allergens: payload.allergens ?? [],
    })
  }

  /**
   * Barcode lookup (spec §8.10, 7.10): local reference first, then
   * Open Food Facts. An OFF hit is returned as a proposal — nothing is
   * persisted until the user confirms the product association.
   */
  static async lookupBarcode(barcode: string): Promise<BarcodeLookupResult> {
    const reference = await ProductReference.query()
      .where('barcode', barcode)
      .preload('product')
      .first()

    if (reference) {
      return { status: 'local', reference }
    }

    const external = await OpenFoodFactsService.lookup(barcode)
    if (external) {
      return { status: 'external', external }
    }

    return { status: 'unknown' }
  }

  /**
   * Creates a commercial reference, attached to an existing product or to
   * a new one created in the same transaction. References imported from
   * OFF hang on global products; manual ones on household products.
   */
  static async createReference(
    household: Household,
    payload: {
      productId?: string
      newProduct?: {
        name: string
        kind?: Product['kind']
        category?: string | null
        defaultUnit?: string
        unitWeightGrams?: number | null
        densityGPerMl?: number | null
      }
      barcode?: string | null
      name: string
      brand?: string | null
      packageQuantity?: number | null
      packageUnit?: string | null
      nutritionPer100?: ProductReference['nutritionPer100']
      imageUrl?: string | null
      shelfLifeDays?: number | null
      source?: ProductReference['source']
    }
  ) {
    return db.transaction(async (trx) => {
      let productId = payload.productId

      if (!productId && payload.newProduct) {
        const product = await Product.create(
          {
            householdId: payload.source === 'off' ? null : household.id,
            name: payload.newProduct.name,
            /** OFF products are food by definition (spec 5.21). */
            kind: payload.source === 'off' ? 'food' : (payload.newProduct.kind ?? 'food'),
            category: payload.newProduct.category ?? null,
            defaultUnit: payload.newProduct.defaultUnit ?? 'g',
            unitWeightGrams: payload.newProduct.unitWeightGrams ?? null,
            densityGPerMl: payload.newProduct.densityGPerMl ?? null,
            nutritionPer100: payload.nutritionPer100 ?? null,
          },
          { client: trx }
        )
        productId = product.id
      }

      if (!productId) {
        throw new Error('Either productId or newProduct is required')
      }

      const reference = await ProductReference.create(
        {
          productId,
          barcode: payload.barcode ?? null,
          name: payload.name,
          brand: payload.brand ?? null,
          packageQuantity: payload.packageQuantity ?? null,
          packageUnit: payload.packageUnit ?? null,
          nutritionPer100: payload.nutritionPer100 ?? null,
          imageUrl: payload.imageUrl ?? null,
          shelfLifeDays: payload.shelfLifeDays ?? null,
          source: payload.source ?? 'manual',
        },
        { client: trx }
      )

      await reference.load('product')
      return reference
    })
  }
}
