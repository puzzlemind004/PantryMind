import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import ProductReference from '#models/product_reference'
import StockItem from '#models/stock_item'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import OpenFoodFactsService from '#services/open_food_facts_service'
import PlanningService from '#services/planning_service'
import RecipeService from '#services/recipe_service'
import { toDateTime } from '#helpers/dates'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const pasta = await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
  await ProductReference.create({
    productId: pasta.id,
    barcode: '3038350208804',
    name: 'Penne 500g',
    packageQuantity: 500,
    packageUnit: 'g',
    source: 'manual',
  })
  return { user, household, pasta }
}

test.group('Shopping | in-store scan (spec §8.9)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let originalFetchJson: typeof OpenFoodFactsService.fetchJson
  group.each.setup(() => {
    originalFetchJson = OpenFoodFactsService.fetchJson
    return () => {
      OpenFoodFactsService.fetchJson = originalFetchJson
    }
  })

  test('scanning checks the matching list line and feeds the stock', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    const lunch = await MealType.query()
      .where('household_id', household.id)
      .where('name', 'Déjeuner')
      .firstOrFail()
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 4,
      ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
    })
    await PlanningService.create(household, user, {
      date: toDateTime(DateTime.now().plus({ days: 1 }).toISODate()!),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })
    await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/scan`)
      .json({ barcode: '3038350208804' })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'checked')
    const items = response.body().data.list.items
    assert.isNotNull(items[0].checkedAt)

    /** Le paquet scanné (500 g) est entré au stock. */
    const stock = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
      .where('status', 'available')
      .firstOrFail()
    assert.equal(stock.quantity, 500)
  })

  test('an unplanned purchase is added and checked in one scan', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/scan`)
      .json({ barcode: '3038350208804' })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'added')
    assert.equal(response.body().data.productName, 'Pâtes')
    assert.isNotNull(response.body().data.list.items[0].checkedAt)

    const stock = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
    assert.lengthOf(stock, 1)
    assert.equal(stock[0].quantity, 500)
  })

  test('an OFF barcode is auto-imported then checked', async ({ client, assert }) => {
    const { user, household } = await setup()
    OpenFoodFactsService.fetchJson = async () => ({
      status: 200,
      json: {
        status: 1,
        product: {
          product_name_fr: 'Lait demi-écrémé',
          brands: 'Lactel',
          product_quantity: '1000',
          product_quantity_unit: 'ml',
          nutriments: {},
        },
      },
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/scan`)
      .json({ barcode: '3155250349793' })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'added')
    assert.equal(response.body().data.productName, 'Lait demi-écrémé')
  })

  test('an unknown barcode returns 404 (manual flow, spec 7.10)', async ({ client }) => {
    const { user, household } = await setup()
    OpenFoodFactsService.fetchJson = async () => ({ status: 200, json: { status: 0 } })

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/scan`)
      .json({ barcode: '0000000000000' })
      .loginAs(user)

    response.assertStatus(404)
  })
})
