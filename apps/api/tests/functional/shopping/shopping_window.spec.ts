import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
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
  const recipe = await RecipeService.create(household, {
    name: 'Pâtes',
    servings: 4,
    ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
  })
  return { user, household, lunch, pasta, recipe }
}

function dayOffset(days: number): string {
  return DateTime.now().plus({ days }).toISODate()!
}

test.group('Shopping | window (spec 5.24)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('the stock is projected at the shopping date', async ({ client, assert }) => {
    const { user, household, lunch, pasta, recipe } = await setup()
    /** 500 g en stock aujourd'hui. */
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })

    /** Demain (avant les courses) : un repas 4 portions consommera 400 g. */
    await PlanningService.create(household, user, {
      date: toDateTime(dayOffset(1)),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })
    /** Après les courses (J+3) : encore 400 g nécessaires. */
    await PlanningService.create(household, user, {
      date: toDateTime(dayOffset(3)),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })

    /** Courses à J+2 : stock projeté = 500 − 400 = 100 g → besoin 300 g. */
    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({ shoppingDate: dayOffset(2), nextShoppingDate: dayOffset(9) })
      .loginAs(user)

    response.assertStatus(200)
    const items = response.body().data.items
    assert.lengthOf(items, 1)
    assert.equal(items[0].neededQuantity, 300)
  })

  test('meals before the shopping date are excluded from the list', async ({ client, assert }) => {
    const { user, household, lunch, recipe } = await setup()

    /** Repas demain, courses à J+2 : ce repas sera déjà passé. */
    await PlanningService.create(household, user, {
      date: toDateTime(dayOffset(1)),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({ shoppingDate: dayOffset(2), nextShoppingDate: dayOffset(9) })
      .loginAs(user)

    /** Rien à acheter pour la période (le repas d'avant est hors fenêtre). */
    assert.lengthOf(response.body().data.items, 0)
  })

  test('meals after the next shopping date are excluded too', async ({ client, assert }) => {
    const { user, household, lunch, recipe } = await setup()

    await PlanningService.create(household, user, {
      date: toDateTime(dayOffset(10)),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({ shoppingDate: dayOffset(0), nextShoppingDate: dayOffset(7) })
      .loginAs(user)

    assert.lengthOf(response.body().data.items, 0)
  })

  test('defaults (today → +7 days) still work', async ({ client, assert }) => {
    const { user, household, lunch, recipe } = await setup()
    await PlanningService.create(household, user, {
      date: toDateTime(dayOffset(3)),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 4 }],
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({})
      .loginAs(user)

    assert.lengthOf(response.body().data.items, 1)
    assert.equal(response.body().data.items[0].neededQuantity, 400)
  })

  test('an inverted window is rejected', async ({ client }) => {
    const { user, household } = await setup()

    const response = await client
      .post(`/api/v1/households/${household.id}/shopping-list/generate`)
      .json({ shoppingDate: dayOffset(7), nextShoppingDate: dayOffset(2) })
      .loginAs(user)

    response.assertStatus(422)
  })
})
