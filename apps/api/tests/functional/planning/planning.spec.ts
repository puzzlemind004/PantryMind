import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import RecipeService from '#services/recipe_service'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const lunch = await MealType.query()
    .where('household_id', household.id)
    .where('name', 'Déjeuner')
    .firstOrFail()
  const pasta = await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
  const recipe = await RecipeService.create(household, {
    name: 'Pâtes au beurre',
    servings: 4,
    ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
  })
  return { user, household, lunch, pasta, recipe }
}

test.group('Planning | meals', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a meal with a frozen recipe snapshot', async ({ client, assert }) => {
    const { user, household, lunch, recipe } = await setup()

    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({
        date: '2026-07-06',
        mealTypeId: lunch.id,
        recipes: [{ recipeId: recipe.id, servings: 2 }],
      })
      .loginAs(user)

    response.assertStatus(201)
    const meal = response.body().data
    assert.equal(meal.date, '2026-07-06')
    assert.equal(meal.mealName, 'Déjeuner')
    assert.equal(meal.effectiveTime, '12:30')
    assert.equal(meal.status, 'planned')
    assert.equal(meal.recipes[0].servings, 2)
    assert.equal(meal.recipes[0].snapshot.name, 'Pâtes au beurre')
    assert.equal(meal.recipes[0].snapshot.baseServings, 4)
    assert.equal(meal.recipes[0].snapshot.ingredients[0].quantity, 400)
  })

  test('recipe edits after planning do not change the snapshot (spec 7.3)', async ({
    client,
    assert,
  }) => {
    const { user, household, lunch, recipe, pasta } = await setup()

    const created = await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-06', mealTypeId: lunch.id, recipes: [{ recipeId: recipe.id }] })
      .loginAs(user)
    const mealId = created.body().data.id

    /** Edit the recipe afterwards: quantity 400 → 999. */
    await RecipeService.update(recipe, household, {
      ingredients: [{ productId: pasta.id, quantity: 999, unit: 'g' }],
    })

    const meal = await client
      .get(`/api/v1/households/${household.id}/planned-meals/${mealId}`)
      .loginAs(user)

    assert.equal(meal.body().data.recipes[0].snapshot.ingredients[0].quantity, 400)
  })

  test('lists meals of a period only', async ({ client, assert }) => {
    const { user, household, lunch } = await setup()
    await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-06', mealTypeId: lunch.id })
      .loginAs(user)
    await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-20', mealTypeId: lunch.id })
      .loginAs(user)

    const response = await client
      .get(`/api/v1/households/${household.id}/planned-meals?from=2026-07-06&to=2026-07-12`)
      .loginAs(user)

    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].date, '2026-07-06')
  })

  test('rejects a stale version with 409 (spec 7.8)', async ({ client }) => {
    const { user, household, lunch } = await setup()
    const created = await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-06', mealTypeId: lunch.id })
      .loginAs(user)
    const mealId = created.body().data.id

    /** First move succeeds and bumps version 1 → 2. */
    const first = await client
      .patch(`/api/v1/households/${household.id}/planned-meals/${mealId}`)
      .json({ version: 1, date: '2026-07-07' })
      .loginAs(user)
    first.assertStatus(200)

    /** Concurrent client still on version 1 must get a conflict. */
    const stale = await client
      .patch(`/api/v1/households/${household.id}/planned-meals/${mealId}`)
      .json({ version: 1, date: '2026-07-08' })
      .loginAs(user)
    stale.assertStatus(409)
  })

  test('duplicates a meal with its snapshots to another date', async ({ client, assert }) => {
    const { user, household, lunch, recipe } = await setup()
    const created = await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-06', mealTypeId: lunch.id, recipes: [{ recipeId: recipe.id }] })
      .loginAs(user)

    const duplicated = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${created.body().data.id}/duplicate`)
      .json({ date: '2026-07-13' })
      .loginAs(user)

    duplicated.assertStatus(201)
    const copy = duplicated.body().data.meals[0]
    assert.equal(copy.date, '2026-07-13')
    assert.equal(copy.status, 'planned')
    assert.equal(copy.recipes[0].snapshot.name, 'Pâtes au beurre')
  })

  test('cancelling a meal keeps it visible without stock impact (spec 7.2)', async ({
    client,
    assert,
  }) => {
    const { user, household, lunch } = await setup()
    const created = await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-06', mealTypeId: lunch.id })
      .loginAs(user)

    const cancelled = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${created.body().data.id}/cancel`)
      .json({ version: 1 })
      .loginAs(user)

    cancelled.assertStatus(200)
    assert.equal(cancelled.body().data.status, 'cancelled')
  })

  test('adds and removes a recipe from a meal', async ({ client, assert }) => {
    const { user, household, lunch, recipe } = await setup()
    const created = await client
      .post(`/api/v1/households/${household.id}/planned-meals`)
      .json({ date: '2026-07-06', mealTypeId: lunch.id })
      .loginAs(user)
    const mealId = created.body().data.id

    const added = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${mealId}/recipes`)
      .json({ recipeId: recipe.id, servings: 3 })
      .loginAs(user)
    added.assertStatus(201)
    assert.lengthOf(added.body().data.recipes, 1)

    const mealRecipeId = added.body().data.recipes[0].id
    const removed = await client
      .delete(`/api/v1/households/${household.id}/planned-meals/${mealId}/recipes/${mealRecipeId}`)
      .loginAs(user)
    removed.assertStatus(204)
  })
})
