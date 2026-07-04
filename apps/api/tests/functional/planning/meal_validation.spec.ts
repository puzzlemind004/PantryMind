import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import StockMovement from '#models/stock_movement'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import PlanningService from '#services/planning_service'
import RecipeService from '#services/recipe_service'
import StockService from '#services/stock_service'
import { toDateTime } from '#helpers/dates'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const lunch = await MealType.query()
    .where('household_id', household.id)
    .where('name', 'Déjeuner')
    .firstOrFail()
  const pasta = await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
  const cheese = await Product.create({
    householdId: household.id,
    name: 'Emmental',
    defaultUnit: 'g',
  })
  return { user, household, lunch, pasta, cheese }
}

async function planMeal(
  household: Awaited<ReturnType<typeof setup>>['household'],
  user: User,
  lunchId: string,
  recipes: { recipeId: string; servings?: number }[]
) {
  return PlanningService.create(household, user, {
    date: toDateTime('2026-07-06'),
    mealTypeId: lunchId,
    recipes,
  })
}

test.group('Meal validation | preview (spec §8.6)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('scales quantities to servings and reports availability', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 150, unit: 'g' })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })
    /** 2 servings out of 4 → 200 g needed, 150 g in stock. */
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id, servings: 2 }])

    const response = await client
      .get(`/api/v1/households/${household.id}/planned-meals/${meal.id}/preview`)
      .loginAs(user)

    response.assertStatus(200)
    const need = response.body().data.needs[0]
    assert.equal(need.quantity, 200)
    assert.equal(need.available, 150)
    assert.equal(need.missing, 50)
  })

  test('merges the same product across recipes (spec 5.14)', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    const recipeA = await RecipeService.create(household, {
      name: 'Plat A',
      servings: 2,
      ingredients: [{ productId: pasta.id, quantity: 200, unit: 'g' }],
    })
    const recipeB = await RecipeService.create(household, {
      name: 'Plat B',
      servings: 2,
      ingredients: [{ productId: pasta.id, quantity: 0.1, unit: 'kg' }],
    })
    const meal = await planMeal(household, user, lunch.id, [
      { recipeId: recipeA.id, servings: 2 },
      { recipeId: recipeB.id, servings: 2 },
    ])

    const response = await client
      .get(`/api/v1/households/${household.id}/planned-meals/${meal.id}/preview`)
      .loginAs(user)

    /** 200 g + 0.1 kg = 300 g merged into one need. */
    assert.lengthOf(response.body().data.needs, 1)
    assert.equal(response.body().data.needs[0].quantity, 300)
    assert.equal(response.body().data.needs[0].unit, 'g')
  })

  test('exposes substitutes with their availability (spec 5.8)', async ({ client, assert }) => {
    const { user, household, lunch, pasta, cheese } = await setup()
    const mozzarella = await Product.create({
      householdId: household.id,
      name: 'Mozzarella',
      defaultUnit: 'g',
    })
    await StockService.addItem(household, user, { productId: cheese.id, quantity: 80, unit: 'g' })
    const recipe = await RecipeService.create(household, {
      name: 'Gratin',
      servings: 2,
      ingredients: [
        { productId: pasta.id, quantity: 200, unit: 'g' },
        { productId: mozzarella.id, quantity: 100, unit: 'g', substituteProductIds: [cheese.id] },
      ],
    })
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id, servings: 2 }])

    const response = await client
      .get(`/api/v1/households/${household.id}/planned-meals/${meal.id}/preview`)
      .loginAs(user)

    const mozzaNeed = response
      .body()
      .data.needs.find((need: { productName: string }) => need.productName === 'Mozzarella')
    assert.equal(mozzaNeed.available, 0)
    assert.equal(mozzaNeed.substitutes[0].productName, 'Emmental')
    assert.equal(mozzaNeed.substitutes[0].available, 80)
  })
})

test.group('Meal validation | complete (spec 5.2)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('consumes the stock FIFO and marks the meal done', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    const item = await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 500,
      unit: 'g',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id, servings: 4 }])

    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 1 })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.meal.status, 'done')
    assert.equal(response.body().data.results[0].consumed, 400)
    assert.equal(response.body().data.results[0].missing, 0)

    await item.refresh()
    assert.equal(item.quantity, 100)

    /** The movement is traced back to the meal (spec §4.12). */
    const movement = await StockMovement.query()
      .where('stock_item_id', item.id)
      .where('type', 'consumed')
      .firstOrFail()
    assert.equal((movement.context as { plannedMealId: string }).plannedMealId, meal.id)
  })

  test('user-adjusted quantities win over the theory (spec 5.3)', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 250, unit: 'g' }],
    })
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id, servings: 4 }])

    /** Recipe says 250 g, the user actually cooked 300 g. */
    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 1, items: [{ productId: pasta.id, quantity: 300, unit: 'g' }] })
      .loginAs(user)

    assert.equal(response.body().data.results[0].consumed, 300)
  })

  test('reports missing quantities without blocking (spec 5.4, 7.5)', async ({
    client,
    assert,
  }) => {
    const { user, household, lunch, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 100, unit: 'g' })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id, servings: 4 }])

    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 1 })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.meal.status, 'done')
    assert.equal(response.body().data.results[0].consumed, 100)
    assert.equal(response.body().data.results[0].missing, 300)
  })

  test('absent optional ingredients are skipped (spec 5.9)', async ({ client, assert }) => {
    const { user, household, lunch, pasta, cheese } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })
    /** No cheese in stock — optional, must be skipped silently. */
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes au fromage',
      servings: 4,
      ingredients: [
        { productId: pasta.id, quantity: 400, unit: 'g' },
        { productId: cheese.id, quantity: 100, unit: 'g', optional: true },
      ],
    })
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id, servings: 4 }])

    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 1 })
      .loginAs(user)

    response.assertStatus(200)
    const productIds = response
      .body()
      .data.results.map((result: { productId: string }) => result.productId)
    assert.include(productIds, pasta.id)
    assert.notInclude(productIds, cheese.id)
  })

  test('a meal cannot be completed twice', async ({ client }) => {
    const { user, household, lunch, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 100, unit: 'g' }],
    })
    const meal = await planMeal(household, user, lunch.id, [{ recipeId: recipe.id }])

    const first = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 1 })
      .loginAs(user)
    first.assertStatus(200)

    const second = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 2 })
      .loginAs(user)
    second.assertStatus(422)
  })

  test('a stale version is rejected with 409 (spec 7.8)', async ({ client }) => {
    const { user, household, lunch } = await setup()
    const meal = await planMeal(household, user, lunch.id, [])
    await PlanningService.update(meal, household, { version: 1, notes: 'modifié' })

    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/complete`)
      .json({ version: 1 })
      .loginAs(user)

    response.assertStatus(409)
  })
})
