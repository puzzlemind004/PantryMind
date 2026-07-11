/** Nutrition facts per 100 g (or 100 ml for liquids). All fields optional. */
export interface NutritionPer100 {
  kcal?: number
  proteins?: number
  carbohydrates?: number
  sugars?: number
  fat?: number
  saturatedFat?: number
  fiber?: number
  salt?: number
}

export const PRODUCT_REFERENCE_SOURCES = ['off', 'manual'] as const
export type ProductReferenceSource = (typeof PRODUCT_REFERENCE_SOURCES)[number]

/**
 * Product kinds (spec 5.21): stock and shopping accept everything,
 * recipes/nutrition/recommendations are restricted to 'food'.
 */
export const PRODUCT_KINDS = ['food', 'cleaning', 'hygiene', 'pet', 'other'] as const
export type ProductKind = (typeof PRODUCT_KINDS)[number]
