import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import MealType from '#models/meal_type'
import Product from '#models/product'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import PlanningService from '#services/planning_service'
import RecipeService from '#services/recipe_service'
import { toDateTime } from '#helpers/dates'

test.group('Planning | multi-day duplication (spec §6.4)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('duplicates a meal to several days in one call', async ({ client, assert }) => {
    const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
    const household = await HouseholdService.create(user, { name: 'Maison' })
    const breakfast = await MealType.query()
      .where('household_id', household.id)
      .where('name', 'Petit-déjeuner')
      .firstOrFail()
    const oats = await Product.create({
      householdId: household.id,
      name: 'Flocons',
      defaultUnit: 'g',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Porridge',
      servings: 1,
      ingredients: [{ productId: oats.id, quantity: 60, unit: 'g' }],
    })
    const meal = await PlanningService.create(household, user, {
      date: toDateTime('2026-07-13'),
      mealTypeId: breakfast.id,
      recipes: [{ recipeId: recipe.id, servings: 1 }],
    })

    /** Le petit-déjeuner reporté sur les 6 jours suivants. */
    const dates = [
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
      '2026-07-17',
      '2026-07-18',
      '2026-07-19',
    ]
    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/duplicate`)
      .json({ dates })
      .loginAs(user)

    response.assertStatus(201)
    const copies = response.body().data.meals
    assert.lengthOf(copies, 6)
    assert.deepEqual(
      copies.map((copy: { date: string }) => copy.date),
      dates
    )
    /** Chaque copie est indépendante avec ses snapshots. */
    assert.equal(copies[0].recipes[0].snapshot.name, 'Porridge')
    assert.notEqual(copies[0].id, copies[1].id)
  })

  test('single-date duplication still works (backward compatibility)', async ({
    client,
    assert,
  }) => {
    const user = await User.create({ email: 'paul@example.com', password: 'secret-password' })
    const household = await HouseholdService.create(user, { name: 'Maison' })
    const lunch = await MealType.query()
      .where('household_id', household.id)
      .where('name', 'Déjeuner')
      .firstOrFail()
    const meal = await PlanningService.create(household, user, {
      date: toDateTime('2026-07-13'),
      mealTypeId: lunch.id,
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/planned-meals/${meal.id}/duplicate`)
      .json({ date: '2026-07-20' })
      .loginAs(user)

    response.assertStatus(201)
    assert.lengthOf(response.body().data.meals, 1)
    assert.equal(response.body().data.meals[0].date, '2026-07-20')
  })
})
