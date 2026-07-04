import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import MealValidationService from '#services/meal_validation_service'
import PlanningService from '#services/planning_service'
import RecipeService from '#services/recipe_service'
import StockService from '#services/stock_service'
import { toDateTime } from '#helpers/dates'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const pasta = await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
  const truffle = await Product.create({
    householdId: household.id,
    name: 'Truffe',
    defaultUnit: 'g',
  })
  return { user, household, pasta, truffle }
}

test.group('Recommendations (spec §6.7)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('feasible recipes rank above infeasible ones, with reasons', async ({ client, assert }) => {
    const { user, household, pasta, truffle } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })

    await RecipeService.create(household, {
      name: 'Pâtes simples',
      servings: 2,
      prepMinutes: 10,
      cookMinutes: 10,
      ingredients: [{ productId: pasta.id, quantity: 200, unit: 'g' }],
    })
    await RecipeService.create(household, {
      name: 'Pâtes à la truffe',
      servings: 2,
      ingredients: [
        { productId: pasta.id, quantity: 200, unit: 'g' },
        { productId: truffle.id, quantity: 20, unit: 'g' },
      ],
    })

    const response = await client
      .get(`/api/v1/households/${household.id}/recommendations`)
      .loginAs(user)

    response.assertStatus(200)
    const recommendations = response.body().data.recommendations
    assert.equal(recommendations[0].recipeName, 'Pâtes simples')
    assert.isAbove(recommendations[0].score, recommendations[1].score)

    const codes = recommendations[0].reasons.map((reason: { code: string }) => reason.code)
    assert.include(codes, 'all_ingredients_available')
    assert.include(codes, 'quick_to_prepare')
  })

  test('expiring stock boosts the recipes that use it', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    const salad = await Product.create({
      householdId: household.id,
      name: 'Salade',
      defaultUnit: 'g',
    })
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })
    /** La salade périme dans 2 jours. */
    await StockService.addItem(household, user, {
      productId: salad.id,
      quantity: 200,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 2 }),
    })

    await RecipeService.create(household, {
      name: 'Pâtes nature',
      servings: 2,
      ingredients: [{ productId: pasta.id, quantity: 200, unit: 'g' }],
    })
    await RecipeService.create(household, {
      name: 'Salade de pâtes',
      servings: 2,
      ingredients: [
        { productId: pasta.id, quantity: 200, unit: 'g' },
        { productId: salad.id, quantity: 100, unit: 'g' },
      ],
    })

    const response = await client
      .get(`/api/v1/households/${household.id}/recommendations`)
      .loginAs(user)

    const recommendations = response.body().data.recommendations
    assert.equal(recommendations[0].recipeName, 'Salade de pâtes')
    const expiringReason = recommendations[0].reasons.find(
      (reason: { code: string }) => reason.code === 'uses_expiring_product'
    )
    assert.equal(expiringReason.params.productName, 'Salade')
    assert.equal(expiringReason.params.days, 2)
  })

  test('recently cooked recipes are demoted (diversity)', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 2000, unit: 'g' })
    const lunch = await MealType.query()
      .where('household_id', household.id)
      .where('name', 'Déjeuner')
      .firstOrFail()

    const cookedYesterday = await RecipeService.create(household, {
      name: 'Déjà mangé',
      servings: 2,
      ingredients: [{ productId: pasta.id, quantity: 200, unit: 'g' }],
    })
    await RecipeService.create(household, {
      name: 'Pas encore mangé',
      servings: 2,
      ingredients: [{ productId: pasta.id, quantity: 200, unit: 'g' }],
    })

    /** Repas d'hier validé avec la première recette. */
    const meal = await PlanningService.create(household, user, {
      date: toDateTime(DateTime.now().minus({ days: 1 }).toISODate()!),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: cookedYesterday.id, servings: 2 }],
    })
    await MealValidationService.complete(meal, household, user, { version: 1 })

    const response = await client
      .get(`/api/v1/households/${household.id}/recommendations`)
      .loginAs(user)

    const recommendations = response.body().data.recommendations
    assert.equal(recommendations[0].recipeName, 'Pas encore mangé')
    const demotedReasons = recommendations
      .find((entry: { recipeName: string }) => entry.recipeName === 'Déjà mangé')
      .reasons.map((reason: { code: string }) => reason.code)
    assert.include(demotedReasons, 'cooked_recently')
  })
})
