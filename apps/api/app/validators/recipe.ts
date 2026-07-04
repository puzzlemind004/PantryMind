import vine from '@vinejs/vine'

import { UNIT_CODES } from '#services/unit_service'

const ingredient = () =>
  vine.object({
    productId: vine.string().uuid(),
    quantity: vine.number().positive(),
    unit: vine.enum(UNIT_CODES),
    optional: vine.boolean().optional(),
    note: vine.string().trim().maxLength(255).nullable().optional(),
    substituteProductIds: vine.array(vine.string().uuid()).optional(),
  })

const recipeFields = {
  name: vine.string().trim().minLength(1).maxLength(150),
  description: vine.string().trim().maxLength(2000).nullable().optional(),
  servings: vine.number().min(1).max(50).optional(),
  prepMinutes: vine.number().min(0).max(1440).nullable().optional(),
  cookMinutes: vine.number().min(0).max(1440).nullable().optional(),
  steps: vine.array(vine.string().trim().minLength(1).maxLength(2000)).optional(),
  tags: vine.array(vine.string().trim().minLength(1).maxLength(40)).optional(),
  imageUrl: vine.string().trim().url().maxLength(1024).nullable().optional(),
  ingredients: vine.array(ingredient()).minLength(1).optional(),
}

export const createRecipeValidator = vine.create({
  ...recipeFields,
  ingredients: vine.array(ingredient()).minLength(1),
})

export const updateRecipeValidator = vine.create({
  ...recipeFields,
  name: recipeFields.name.clone().optional(),
})

export const listRecipesValidator = vine.create({
  search: vine.string().trim().maxLength(100).optional(),
  tag: vine.string().trim().maxLength(40).optional(),
  /** Total preparation time ceiling (prep + cook), in minutes. */
  maxMinutes: vine.number().min(1).max(2880).optional(),
})

export const feasibilityValidator = vine.create({
  servings: vine.number().min(1).max(50).optional(),
})
