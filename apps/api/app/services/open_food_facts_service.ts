import logger from '@adonisjs/core/services/logger'

import type { NutritionPer100 } from '#types/catalog'

export interface ExternalProductData {
  barcode: string
  name: string
  brand: string | null
  packageQuantity: number | null
  packageUnit: string | null
  imageUrl: string | null
  nutritionPer100: NutritionPer100 | null
  categories: string[]
  allergens: string[]
}

const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product'
const OFF_FIELDS = [
  'product_name',
  'product_name_fr',
  'brands',
  'product_quantity',
  'product_quantity_unit',
  'image_front_url',
  'nutriments',
  'categories_tags',
  'allergens_tags',
].join(',')

/**
 * Server-side Open Food Facts lookup (docs/architecture.md §6).
 * Imported data becomes local afterwards: OFF is never queried on reads.
 */
export default class OpenFoodFactsService {
  /** Overridable in tests to avoid network calls. */
  static fetchJson: (url: string) => Promise<{ status: number; json: any }> = async (url) => {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Cooking - personal food assistant (dev)' },
      signal: AbortSignal.timeout(8000),
    })
    return { status: response.status, json: response.ok ? await response.json() : null }
  }

  static async lookup(barcode: string): Promise<ExternalProductData | null> {
    try {
      const { status, json } = await this.fetchJson(
        `${OFF_BASE_URL}/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`
      )

      if (status !== 200 || !json || json.status !== 1 || !json.product) {
        return null
      }

      return this.mapProduct(barcode, json.product)
    } catch (error) {
      logger.warn({ err: error, barcode }, 'Open Food Facts lookup failed')
      return null
    }
  }

  private static mapProduct(barcode: string, product: any): ExternalProductData {
    const nutriments = product.nutriments ?? {}
    const nutrition: NutritionPer100 = {
      kcal: this.numberOrUndefined(nutriments['energy-kcal_100g']),
      proteins: this.numberOrUndefined(nutriments['proteins_100g']),
      carbohydrates: this.numberOrUndefined(nutriments['carbohydrates_100g']),
      sugars: this.numberOrUndefined(nutriments['sugars_100g']),
      fat: this.numberOrUndefined(nutriments['fat_100g']),
      saturatedFat: this.numberOrUndefined(nutriments['saturated-fat_100g']),
      fiber: this.numberOrUndefined(nutriments['fiber_100g']),
      salt: this.numberOrUndefined(nutriments['salt_100g']),
    }
    const hasNutrition = Object.values(nutrition).some((value) => value !== undefined)

    const packageUnit =
      typeof product.product_quantity_unit === 'string'
        ? product.product_quantity_unit.toLowerCase()
        : null

    return {
      barcode,
      name: product.product_name_fr || product.product_name || 'Produit sans nom',
      brand: product.brands?.split(',')[0]?.trim() || null,
      packageQuantity: this.numberOrUndefined(product.product_quantity) ?? null,
      packageUnit,
      imageUrl: product.image_front_url || null,
      nutritionPer100: hasNutrition ? nutrition : null,
      categories: this.cleanTags(product.categories_tags),
      allergens: this.cleanTags(product.allergens_tags),
    }
  }

  private static numberOrUndefined(value: unknown): number | undefined {
    const parsed = typeof value === 'string' ? Number.parseFloat(value) : value
    return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined
  }

  /** OFF tags look like "en:milk" — keep the readable part. */
  private static cleanTags(tags: unknown): string[] {
    if (!Array.isArray(tags)) {
      return []
    }
    return tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.replace(/^[a-z]{2}:/, ''))
  }
}
