import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'

import IngredientSubstitute from '#models/ingredient_substitute'
import Product from '#models/product'
import Recipe from '#models/recipe'
import RecipeIngredient from '#models/recipe_ingredient'
import StockAvailabilityService from '#services/stock_availability_service'
import type Household from '#models/household'

export interface IngredientPayload {
  productId: string
  quantity: number
  unit: string
  optional?: boolean
  note?: string | null
  substituteProductIds?: string[]
}

export interface RecipePayload {
  name?: string
  description?: string | null
  servings?: number
  prepMinutes?: number | null
  cookMinutes?: number | null
  steps?: string[]
  tags?: string[]
  imageUrl?: string | null
  ingredients?: IngredientPayload[]
}

export default class RecipeService {
  /** Non-deleted recipes of the household. */
  static baseQuery(household: Household) {
    return Recipe.query().where('household_id', household.id).whereNull('deleted_at')
  }

  static async create(household: Household, payload: RecipePayload & { name: string }) {
    await this.assertProductsVisible(household, payload.ingredients ?? [])

    return db.transaction(async (trx) => {
      const recipe = await Recipe.create(
        {
          householdId: household.id,
          name: payload.name,
          description: payload.description ?? null,
          servings: payload.servings ?? 4,
          prepMinutes: payload.prepMinutes ?? null,
          cookMinutes: payload.cookMinutes ?? null,
          steps: payload.steps ?? [],
          tags: payload.tags ?? [],
          imageUrl: payload.imageUrl ?? null,
        },
        { client: trx }
      )

      await this.createIngredients(recipe, payload.ingredients ?? [], trx)
      await this.loadFull(recipe)
      return recipe
    })
  }

  /**
   * Updates a recipe. Ingredients are replaced wholesale when provided —
   * already-planned meals are untouched thanks to snapshots (spec 7.3).
   */
  static async update(recipe: Recipe, household: Household, payload: RecipePayload) {
    if (payload.ingredients) {
      await this.assertProductsVisible(household, payload.ingredients)
    }

    return db.transaction(async (trx) => {
      recipe.useTransaction(trx)
      recipe.merge({
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.servings !== undefined ? { servings: payload.servings } : {}),
        ...(payload.prepMinutes !== undefined ? { prepMinutes: payload.prepMinutes } : {}),
        ...(payload.cookMinutes !== undefined ? { cookMinutes: payload.cookMinutes } : {}),
        ...(payload.steps !== undefined ? { steps: payload.steps } : {}),
        ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
        ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      })
      await recipe.save()

      if (payload.ingredients) {
        await RecipeIngredient.query({ client: trx }).where('recipe_id', recipe.id).delete()
        await this.createIngredients(recipe, payload.ingredients, trx)
      }

      await this.loadFull(recipe)
      return recipe
    })
  }

  /** Duplicates a recipe with its ingredients and substitutes. */
  static async duplicate(recipe: Recipe, household: Household) {
    await recipe.load('ingredients', (query) => query.preload('substitutes'))

    return db.transaction(async (trx) => {
      const copy = await Recipe.create(
        {
          householdId: household.id,
          name: `${recipe.name} (copie)`,
          description: recipe.description,
          servings: recipe.servings,
          prepMinutes: recipe.prepMinutes,
          cookMinutes: recipe.cookMinutes,
          steps: recipe.steps,
          tags: recipe.tags,
          imageUrl: recipe.imageUrl,
        },
        { client: trx }
      )

      await this.createIngredients(
        copy,
        recipe.ingredients.map((ingredient) => ({
          productId: ingredient.productId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          optional: ingredient.optional,
          note: ingredient.note,
          substituteProductIds: ingredient.substitutes.map((substitute) => substitute.productId),
        })),
        trx
      )

      await this.loadFull(copy)
      return copy
    })
  }

  static async softDelete(recipe: Recipe) {
    recipe.deletedAt = DateTime.now()
    await recipe.save()
  }

  /**
   * Feasibility against the current stock (spec §8.7): per ingredient,
   * required quantity (scaled to the requested servings, spec 5.10) vs
   * available quantity. Optional ingredients never block (spec 5.9).
   */
  static async feasibility(recipe: Recipe, household: Household, servings?: number) {
    await recipe.load('ingredients', (query) => query.preload('product').orderBy('position'))

    const ratio = (servings ?? recipe.servings) / recipe.servings
    const availability = await StockAvailabilityService.availabilityFor(
      household.id,
      recipe.ingredients.map((ingredient) => ({
        productId: ingredient.productId,
        unit: ingredient.unit,
      }))
    )

    const ingredients = recipe.ingredients.map((ingredient) => {
      const required = Number((ingredient.quantity * ratio).toFixed(3))
      const available = availability.get(ingredient.productId) ?? 0
      return {
        recipeIngredientId: ingredient.id,
        productId: ingredient.productId,
        productName: ingredient.product.name,
        unit: ingredient.unit,
        optional: ingredient.optional,
        required,
        available,
        missing: Math.max(Number((required - available).toFixed(3)), 0),
      }
    })

    return {
      servings: servings ?? recipe.servings,
      feasible: ingredients.every((ingredient) => ingredient.optional || ingredient.missing === 0),
      ingredients,
    }
  }

  private static async createIngredients(
    recipe: Recipe,
    ingredients: IngredientPayload[],
    trx: Parameters<Recipe['useTransaction']>[0]
  ) {
    for (const [position, payload] of ingredients.entries()) {
      const ingredient = await RecipeIngredient.create(
        {
          recipeId: recipe.id,
          productId: payload.productId,
          quantity: payload.quantity,
          unit: payload.unit,
          optional: payload.optional ?? false,
          note: payload.note ?? null,
          position,
        },
        { client: trx }
      )

      for (const substituteProductId of payload.substituteProductIds ?? []) {
        await IngredientSubstitute.create(
          { recipeIngredientId: ingredient.id, productId: substituteProductId },
          { client: trx }
        )
      }
    }
  }

  /**
   * All ingredient products (substitutes included) must be visible to
   * the household AND edible — recipes are food-only (spec 5.21).
   */
  private static async assertProductsVisible(
    household: Household,
    ingredients: IngredientPayload[]
  ) {
    const productIds = [
      ...new Set(
        ingredients.flatMap((ingredient) => [
          ingredient.productId,
          ...(ingredient.substituteProductIds ?? []),
        ])
      ),
    ]
    if (productIds.length === 0) {
      return
    }

    const products = await Product.query()
      .whereIn('id', productIds)
      .where((scope) => {
        scope.whereNull('household_id').orWhere('household_id', household.id)
      })

    if (products.length !== productIds.length) {
      throw new Exception('Un ou plusieurs produits sont inconnus pour ce foyer', {
        status: 422,
        code: 'PRODUCT_NOT_FOUND',
      })
    }

    const nonFood = products.filter((product) => product.kind !== 'food')
    if (nonFood.length > 0) {
      throw new Exception(
        `Produit non alimentaire refusé dans une recette : ${nonFood
          .map((product) => product.name)
          .join(', ')}`,
        { status: 422, code: 'NON_FOOD_INGREDIENT' }
      )
    }
  }

  private static async loadFull(recipe: Recipe) {
    await recipe.load('ingredients', (query) =>
      query
        .preload('product')
        .preload('substitutes', (sub) => sub.preload('product'))
        .orderBy('position')
    )
  }
}
