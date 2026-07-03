import vine from '@vinejs/vine'

import { UNIT_CODES } from '#services/unit_service'

const nutritionPer100 = () =>
  vine.object({
    kcal: vine.number().min(0).optional(),
    proteins: vine.number().min(0).optional(),
    carbohydrates: vine.number().min(0).optional(),
    sugars: vine.number().min(0).optional(),
    fat: vine.number().min(0).optional(),
    saturatedFat: vine.number().min(0).optional(),
    fiber: vine.number().min(0).optional(),
    salt: vine.number().min(0).optional(),
  })

const productFields = {
  name: vine.string().trim().minLength(1).maxLength(150),
  category: vine.string().trim().maxLength(100).nullable().optional(),
  defaultUnit: vine.enum(UNIT_CODES).optional(),
  unitWeightGrams: vine.number().positive().nullable().optional(),
  densityGPerMl: vine.number().positive().nullable().optional(),
  nutritionPer100: nutritionPer100().nullable().optional(),
  allergens: vine.array(vine.string().trim().maxLength(60)).optional(),
}

export const createProductValidator = vine.create(productFields)

export const updateProductValidator = vine.create({
  ...productFields,
  name: productFields.name.clone().optional(),
})

export const searchProductsValidator = vine.create({
  search: vine.string().trim().maxLength(100).optional(),
})

export const createReferenceValidator = vine.create({
  /** Attach to an existing product, or create one in the same call. */
  productId: vine.string().uuid().optional(),
  newProduct: vine
    .object({
      name: vine.string().trim().minLength(1).maxLength(150),
      category: vine.string().trim().maxLength(100).nullable().optional(),
      defaultUnit: vine.enum(UNIT_CODES).optional(),
      unitWeightGrams: vine.number().positive().nullable().optional(),
      densityGPerMl: vine.number().positive().nullable().optional(),
    })
    .optional(),

  barcode: vine.string().trim().minLength(4).maxLength(32).nullable().optional(),
  name: vine.string().trim().minLength(1).maxLength(200),
  brand: vine.string().trim().maxLength(100).nullable().optional(),
  packageQuantity: vine.number().positive().nullable().optional(),
  packageUnit: vine.enum(UNIT_CODES).nullable().optional(),
  nutritionPer100: nutritionPer100().nullable().optional(),
  imageUrl: vine.string().trim().url().maxLength(1024).nullable().optional(),
  shelfLifeDays: vine.number().min(1).max(3650).nullable().optional(),
  source: vine.enum(['off', 'manual'] as const).optional(),
})
