import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

import Recipe from '#models/recipe'
import StockItem from '#models/stock_item'
import StockAvailabilityService from '#services/stock_availability_service'
import type Household from '#models/household'

/** Transparent reason codes, translated by the client (spec 9.5). */
export interface RecommendationReason {
  code:
    | 'all_ingredients_available'
    | 'most_ingredients_available'
    | 'uses_expiring_product'
    | 'not_cooked_recently'
    | 'cooked_recently'
    | 'quick_to_prepare'
  params?: Record<string, string | number>
}

export interface Recommendation {
  recipeId: string
  recipeName: string
  totalMinutes: number | null
  score: number
  reasons: RecommendationReason[]
}

const EXPIRY_HORIZON_DAYS = 5
const RECENT_MEAL_DAYS = 7

const WEIGHTS = { availability: 0.45, expiry: 0.3, diversity: 0.15, quickness: 0.1 }

/**
 * Recipe suggestion engine (spec §6.7): scores every recipe of the
 * household against the current stock, expiring lots, recent meals and
 * preparation time. Pure suggestions — never a decision (spec §6.7),
 * always explained (spec 9.5).
 */
export default class RecommendationService {
  static async suggest(household: Household, options: { limit?: number } = {}) {
    const limit = options.limit ?? 10

    const recipes = await Recipe.query()
      .where('household_id', household.id)
      .whereNull('deleted_at')
      .preload('ingredients', (query) => query.preload('product'))

    if (recipes.length === 0) {
      return []
    }

    const [availability, expiringByProduct, recentRecipeIds] = await Promise.all([
      StockAvailabilityService.availabilityFor(
        household.id,
        recipes.flatMap((recipe) =>
          recipe.ingredients.map((ingredient) => ({
            productId: ingredient.productId,
            unit: ingredient.unit,
          }))
        )
      ),
      this.expiringProducts(household),
      this.recentlyCookedRecipeIds(household),
    ])

    const recommendations = recipes.map((recipe) =>
      this.scoreRecipe(recipe, availability, expiringByProduct, recentRecipeIds)
    )

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  private static scoreRecipe(
    recipe: Recipe,
    availability: Map<string, number>,
    expiringByProduct: Map<string, { name: string; days: number }>,
    recentRecipeIds: Set<string>
  ): Recommendation {
    const reasons: RecommendationReason[] = []

    /** Availability: average covered ratio of required ingredients (spec §6.7). */
    const required = recipe.ingredients.filter((ingredient) => !ingredient.optional)
    let availabilityScore = 1
    if (required.length > 0) {
      const ratios = required.map((ingredient) => {
        const available =
          availability.get(StockAvailabilityService.key(ingredient.productId, ingredient.unit)) ?? 0
        return Math.min(available / ingredient.quantity, 1)
      })
      availabilityScore = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
    }
    if (availabilityScore === 1) {
      reasons.push({ code: 'all_ingredients_available' })
    } else if (availabilityScore >= 0.7) {
      reasons.push({
        code: 'most_ingredients_available',
        params: { percent: Math.round(availabilityScore * 100) },
      })
    }

    /** Expiry urgency: strongest signal among the recipe's products (spec §6.7). */
    let expiryScore = 0
    for (const ingredient of recipe.ingredients) {
      const expiring = expiringByProduct.get(ingredient.productId)
      if (expiring) {
        const urgency = (EXPIRY_HORIZON_DAYS - expiring.days) / EXPIRY_HORIZON_DAYS
        if (urgency > expiryScore) {
          expiryScore = urgency
        }
        reasons.push({
          code: 'uses_expiring_product',
          params: { productName: expiring.name, days: expiring.days },
        })
      }
    }

    /** Diversity: demote recipes cooked in the last days (spec §6.7). */
    const cookedRecently = recentRecipeIds.has(recipe.id)
    const diversityScore = cookedRecently ? 0 : 1
    reasons.push({ code: cookedRecently ? 'cooked_recently' : 'not_cooked_recently' })

    /** Preparation time. */
    const totalMinutes =
      recipe.prepMinutes !== null || recipe.cookMinutes !== null
        ? (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)
        : null
    const quicknessScore =
      totalMinutes === null ? 0.5 : totalMinutes <= 30 ? 1 : totalMinutes <= 60 ? 0.5 : 0.2
    if (totalMinutes !== null && totalMinutes <= 30) {
      reasons.push({ code: 'quick_to_prepare', params: { minutes: totalMinutes } })
    }

    const score = Number(
      (
        WEIGHTS.availability * availabilityScore +
        WEIGHTS.expiry * expiryScore +
        WEIGHTS.diversity * diversityScore +
        WEIGHTS.quickness * quicknessScore
      ).toFixed(3)
    )

    return { recipeId: recipe.id, recipeName: recipe.name, totalMinutes, score, reasons }
  }

  /** productId → closest expiry (days) among available lots expiring soon. */
  private static async expiringProducts(household: Household) {
    const horizon = DateTime.now().plus({ days: EXPIRY_HORIZON_DAYS }).toISODate()!
    const lots = await StockItem.query()
      .where('household_id', household.id)
      .where('status', 'available')
      .whereNotNull('expires_at')
      .where('expires_at', '<=', horizon)
      .preload('product')

    const map = new Map<string, { name: string; days: number }>()
    const today = DateTime.now().startOf('day')
    for (const lot of lots) {
      const days = Math.max(Math.ceil(lot.expiresAt!.diff(today, 'days').days), 0)
      const existing = map.get(lot.productId)
      if (!existing || days < existing.days) {
        map.set(lot.productId, { name: lot.product.name, days })
      }
    }
    return map
  }

  /** Recipes attached to meals completed within the diversity window. */
  private static async recentlyCookedRecipeIds(household: Household) {
    const since = DateTime.now().minus({ days: RECENT_MEAL_DAYS }).toISODate()!
    const rows = await db
      .from('planned_meal_recipes')
      .join('planned_meals', 'planned_meals.id', 'planned_meal_recipes.planned_meal_id')
      .where('planned_meals.household_id', household.id)
      .where('planned_meals.status', 'done')
      .where('planned_meals.date', '>=', since)
      .whereNotNull('planned_meal_recipes.recipe_id')
      .select('planned_meal_recipes.recipe_id')

    return new Set<string>(rows.map((row) => row.recipe_id))
  }
}
