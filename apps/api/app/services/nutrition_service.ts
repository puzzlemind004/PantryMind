import Product from '#models/product'
import UnitService from '#services/unit_service'
import type PlannedMeal from '#models/planned_meal'
import type Recipe from '#models/recipe'

export const NUTRIENT_KEYS = [
  'kcal',
  'proteins',
  'carbohydrates',
  'sugars',
  'fat',
  'saturatedFat',
  'fiber',
  'salt',
] as const
export type NutrientKey = (typeof NUTRIENT_KEYS)[number]

export type NutritionTotals = Partial<Record<NutrientKey, number>>

export interface NutritionSummary {
  totals: NutritionTotals
  /** Ingredients that actually contributed to the totals. */
  coveredIngredients: number
  totalIngredients: number
  /** Products without nutrition data or with unconvertible quantities (spec §2 : « lorsque les données existent »). */
  missingProducts: string[]
}

interface NutritionInput {
  product: Pick<Product, 'name' | 'nutritionPer100' | 'unitWeightGrams' | 'densityGPerMl'>
  quantity: number
  unit: string
}

/**
 * Nutrition aggregation (spec §2, §6.3): products carry values per
 * 100 g/ml (from Open Food Facts, CIQUAL or manual input); quantities
 * are converted to grams through the shared unit service. Ingredients
 * without data are reported, never silently ignored (spec §10.5).
 */
export default class NutritionService {
  static aggregate(items: NutritionInput[]): NutritionSummary {
    const totals: NutritionTotals = {}
    const missingProducts: string[] = []
    let covered = 0

    for (const item of items) {
      const nutrition = item.product.nutritionPer100
      const grams = UnitService.convert(item.quantity, item.unit, 'g', {
        unitWeightGrams: item.product.unitWeightGrams,
        densityGPerMl: item.product.densityGPerMl ?? 1,
      })

      if (!nutrition || grams === null) {
        missingProducts.push(item.product.name)
        continue
      }

      covered += 1
      const factor = grams / 100
      for (const key of NUTRIENT_KEYS) {
        const value = nutrition[key]
        if (typeof value === 'number') {
          totals[key] = Number(((totals[key] ?? 0) + value * factor).toFixed(1))
        }
      }
    }

    return {
      totals,
      coveredIngredients: covered,
      totalIngredients: items.length,
      missingProducts,
    }
  }

  /** Recipe nutrition, total and per serving (spec §4.7). */
  static async forRecipe(recipe: Recipe, servings?: number) {
    await recipe.load('ingredients', (query) => query.preload('product'))

    const summary = this.aggregate(
      recipe.ingredients.map((ingredient) => ({
        product: ingredient.product,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))
    )

    const requestedServings = servings ?? recipe.servings
    const ratio = requestedServings / recipe.servings

    return {
      servings: requestedServings,
      total: this.scale(summary.totals, ratio),
      perServing: this.scale(summary.totals, 1 / recipe.servings),
      coveredIngredients: summary.coveredIngredients,
      totalIngredients: summary.totalIngredients,
      missingProducts: summary.missingProducts,
    }
  }

  /** Planned-meal nutrition from its frozen snapshots (spec §4.10). */
  static async forPlannedMeal(meal: PlannedMeal): Promise<NutritionSummary> {
    await meal.load('recipes')

    const productIds = [
      ...new Set(
        meal.recipes.flatMap((mealRecipe) =>
          mealRecipe.snapshot.ingredients.map((ingredient) => ingredient.productId)
        )
      ),
    ]
    const products = await Product.query().whereIn('id', productIds)
    const productById = new Map(products.map((product) => [product.id, product]))

    const items: NutritionInput[] = []
    for (const mealRecipe of meal.recipes) {
      const ratio = mealRecipe.servings / mealRecipe.snapshot.baseServings
      for (const ingredient of mealRecipe.snapshot.ingredients) {
        const product = productById.get(ingredient.productId)
        if (!product) {
          continue
        }
        items.push({
          product,
          quantity: Number((ingredient.quantity * ratio).toFixed(3)),
          unit: ingredient.unit,
        })
      }
    }

    return this.aggregate(items)
  }

  private static scale(totals: NutritionTotals, ratio: number): NutritionTotals {
    const scaled: NutritionTotals = {}
    for (const key of NUTRIENT_KEYS) {
      const value = totals[key]
      if (typeof value === 'number') {
        scaled[key] = Number((value * ratio).toFixed(1))
      }
    }
    return scaled
  }
}
