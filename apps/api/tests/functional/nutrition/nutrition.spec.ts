import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import PlanningService from '#services/planning_service'
import RecipeService from '#services/recipe_service'
import { toDateTime } from '#helpers/dates'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  /** 350 kcal / 12 g de protéines pour 100 g. */
  const pasta = await Product.create({
    householdId: household.id,
    name: 'Pâtes',
    defaultUnit: 'g',
    nutritionPer100: { kcal: 350, proteins: 12 },
  })
  /** 1 œuf ≈ 50 g, 145 kcal / 12,5 g de protéines pour 100 g. */
  const eggs = await Product.create({
    householdId: household.id,
    name: 'Œufs',
    defaultUnit: 'unit',
    unitWeightGrams: 50,
    nutritionPer100: { kcal: 145, proteins: 12.5 },
  })
  return { user, household, pasta, eggs }
}

test.group('Nutrition | recipe (spec §4.7)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('computes totals and per-serving values with unit conversion', async ({
    client,
    assert,
  }) => {
    const { user, household, pasta, eggs } = await setup()
    const recipe = await RecipeService.create(household, {
      name: 'Carbonara',
      servings: 4,
      ingredients: [
        { productId: pasta.id, quantity: 400, unit: 'g' },
        /** 4 œufs = 200 g → 290 kcal. */
        { productId: eggs.id, quantity: 4, unit: 'unit' },
      ],
    })

    const response = await client
      .get(`/api/v1/households/${household.id}/recipes/${recipe.id}/nutrition`)
      .loginAs(user)

    response.assertStatus(200)
    const data = response.body().data
    /** 400 g de pâtes = 1400 kcal + 4 œufs (200 g) = 290 kcal → 1690. */
    assert.equal(data.total.kcal, 1690)
    assert.equal(data.perServing.kcal, 422.5)
    assert.equal(data.total.proteins, 73)
    assert.equal(data.coveredIngredients, 2)
    assert.lengthOf(data.missingProducts, 0)
  })

  test('reports products without nutrition data (spec §10.5)', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    const mystery = await Product.create({
      householdId: household.id,
      name: 'Épice mystère',
      defaultUnit: 'g',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes épicées',
      servings: 2,
      ingredients: [
        { productId: pasta.id, quantity: 200, unit: 'g' },
        { productId: mystery.id, quantity: 5, unit: 'g' },
      ],
    })

    const response = await client
      .get(`/api/v1/households/${household.id}/recipes/${recipe.id}/nutrition`)
      .loginAs(user)

    const data = response.body().data
    assert.equal(data.total.kcal, 700)
    assert.deepEqual(data.missingProducts, ['Épice mystère'])
  })
})

test.group('Nutrition | daily (spec §2)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('sums all non-cancelled meals of the day', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    const lunch = await MealType.query()
      .where('household_id', household.id)
      .where('name', 'Déjeuner')
      .firstOrFail()
    const dinner = await MealType.query()
      .where('household_id', household.id)
      .where('name', 'Dîner')
      .firstOrFail()
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })

    /** Déjeuner 2 portions (700 kcal) + dîner 4 portions (1400 kcal). */
    await PlanningService.create(household, user, {
      date: toDateTime('2026-07-06'),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 2 }],
    })
    await PlanningService.create(household, user, {
      date: toDateTime('2026-07-06'),
      mealTypeId: dinner.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })

    const response = await client
      .get(`/api/v1/households/${household.id}/nutrition/daily?date=2026-07-06`)
      .loginAs(user)

    response.assertStatus(200)
    const data = response.body().data
    assert.equal(data.totals.kcal, 2100)
    assert.lengthOf(data.meals, 2)
    assert.equal(data.meals[0].totals.kcal, 700)
  })
})
