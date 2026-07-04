import vine from '@vinejs/vine'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const mealRecipe = () =>
  vine.object({
    recipeId: vine.string().uuid(),
    servings: vine.number().min(0.5).max(100).optional(),
  })

export const listPlannedMealsValidator = vine.create({
  from: vine.date(),
  to: vine.date(),
})

export const createPlannedMealValidator = vine.create({
  date: vine.date(),
  mealTypeId: vine.string().uuid(),
  timeOverride: vine.string().regex(TIME_PATTERN).nullable().optional(),
  notes: vine.string().trim().maxLength(500).nullable().optional(),
  recipes: vine.array(mealRecipe()).optional(),
})

export const updatePlannedMealValidator = vine.create({
  version: vine.number().min(1),
  date: vine.date().optional(),
  mealTypeId: vine.string().uuid().optional(),
  timeOverride: vine.string().regex(TIME_PATTERN).nullable().optional(),
  notes: vine.string().trim().maxLength(500).nullable().optional(),
})

export const cancelPlannedMealValidator = vine.create({
  version: vine.number().min(1),
})

export const duplicatePlannedMealValidator = vine.create({
  date: vine.date(),
})

export const addMealRecipeValidator = vine.create({
  recipeId: vine.string().uuid(),
  servings: vine.number().min(0.5).max(100).optional(),
})

export const updateMealRecipeValidator = vine.create({
  servings: vine.number().min(0.5).max(100),
})
