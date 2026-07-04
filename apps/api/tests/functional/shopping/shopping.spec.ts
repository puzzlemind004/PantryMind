import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import ProductReference from '#models/product_reference'
import StockItem from '#models/stock_item'
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
  return { user, household, lunch, pasta }
}

/** Repas planifié demain avec la recette donnée. */
async function planTomorrow(
  household: Awaited<ReturnType<typeof setup>>['household'],
  user: User,
  lunchId: string,
  recipeId: string,
  servings: number
) {
  return PlanningService.create(household, user, {
    date: toDateTime(new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)),
    mealTypeId: lunchId,
    recipes: [{ recipeId, servings }],
  })
}

test.group('Shopping | generation (spec 5.13)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('planning needs minus stock become list items', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 150, unit: 'g' })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })
    await planTomorrow(household, user, lunch.id, recipe.id, 4)

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)

    response.assertStatus(200)
    const items = response.body().data.items
    assert.lengthOf(items, 1)
    /** 400 g needed − 150 g in stock = 250 g to buy. */
    assert.equal(items[0].neededQuantity, 250)
    assert.equal(items[0].source, 'planning')
  })

  test('threshold deficits are added (spec 5.16)', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 100, unit: 'g' })

    await client
      .put(`/api/v1/households/${household.id}/product-thresholds`)
      .json({ productId: pasta.id, minQuantity: 500, unit: 'g' })
      .loginAs(user)

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)

    const items = response.body().data.items
    assert.lengthOf(items, 1)
    /** 500 g minimum − 100 g in stock = 400 g top-up. */
    assert.equal(items[0].neededQuantity, 400)
    assert.equal(items[0].source, 'min_stock')
  })

  test('optional ingredients are never bought (spec 5.9)', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    const cheese = await Product.create({
      householdId: household.id,
      name: 'Emmental',
      defaultUnit: 'g',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes au fromage',
      servings: 4,
      ingredients: [
        { productId: pasta.id, quantity: 400, unit: 'g' },
        { productId: cheese.id, quantity: 100, unit: 'g', optional: true },
      ],
    })
    await planTomorrow(household, user, lunch.id, recipe.id, 4)

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)

    const names = response
      .body()
      .data.items.map((item: { productName: string }) => item.productName)
    assert.deepEqual(names, ['Pâtes'])
  })

  test('suggests the packaging with the least surplus (spec 5.15, 7.12)', async ({
    client,
    assert,
  }) => {
    const { user, household, lunch, pasta } = await setup()
    await ProductReference.create({
      productId: pasta.id,
      name: 'Paquet 500g',
      packageQuantity: 500,
      packageUnit: 'g',
      source: 'manual',
    })
    await ProductReference.create({
      productId: pasta.id,
      name: 'Paquet 1kg',
      packageQuantity: 1,
      packageUnit: 'kg',
      source: 'manual',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 300, unit: 'g' }],
    })
    await planTomorrow(household, user, lunch.id, recipe.id, 4)

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)

    const item = response.body().data.items[0]
    /** Besoin 300 g → 1 paquet de 500 g (surplus 200 g < 700 g). */
    assert.equal(item.packageCount, 1)
    assert.equal(item.packaging.name, 'Paquet 500g')
  })

  test('regeneration keeps manual and checked items', async ({ client, assert }) => {
    const { user, household, lunch, pasta } = await setup()
    const coffee = await Product.create({
      householdId: household.id,
      name: 'Café',
      defaultUnit: 'g',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })
    await planTomorrow(household, user, lunch.id, recipe.id, 4)

    /** Manual item added by the user. */
    await client
      .post(`/api/v1/households/${household.id}/shopping-list/items`)
      .json({ productId: coffee.id, quantity: 250, unit: 'g' })
      .loginAs(user)

    const first = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)
    assert.lengthOf(first.body().data.items, 2)

    const second = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)
    const sources = second
      .body()
      .data.items.map((item: { source: string }) => item.source)
      .sort()
    assert.deepEqual(sources, ['manual', 'planning'])
  })
})

test.group('Shopping | purchases (spec §8.9)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('checking an item adds the full package to the stock (spec 7.12)', async ({
    client,
    assert,
  }) => {
    const { user, household, lunch, pasta } = await setup()
    await ProductReference.create({
      productId: pasta.id,
      name: 'Paquet 500g',
      packageQuantity: 500,
      packageUnit: 'g',
      source: 'manual',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 300, unit: 'g' }],
    })
    await planTomorrow(household, user, lunch.id, recipe.id, 4)
    const generated = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)
    const itemId = generated.body().data.items[0].id

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/items/${itemId}/check`)
      .json({})
      .loginAs(user)

    response.assertStatus(200)
    const checked = response.body().data.items.find((item: { id: string }) => item.id === itemId)
    assert.isNotNull(checked.checkedAt)

    /** The stock got the whole 500 g package, not just the 300 g need. */
    const stockItems = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
      .where('status', 'available')
    assert.lengthOf(stockItems, 1)
    assert.equal(stockItems[0].quantity, 500)
    assert.equal(stockItems[0].unit, 'g')
  })

  test('unchecking an untouched purchase reverts the stock entry', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    await client
      .post(`/api/v1/households/${household.id}/shopping-list/items`)
      .json({ productId: pasta.id, quantity: 200, unit: 'g' })
      .loginAs(user)
    const list = await client.get(`/api/v1/households/${household.id}/shopping-list`).loginAs(user)
    const itemId = list.body().data.items[0].id

    await client
      .post(`/api/v1/households/${household.id}/shopping-list/items/${itemId}/check`)
      .json({})
      .loginAs(user)
    await client
      .post(`/api/v1/households/${household.id}/shopping-list/items/${itemId}/uncheck`)
      .json({})
      .loginAs(user)

    const stockItems = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
    assert.lengthOf(stockItems, 0)
  })
})
