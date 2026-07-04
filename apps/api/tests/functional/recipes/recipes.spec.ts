import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import Recipe from '#models/recipe'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import StockService from '#services/stock_service'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const pasta = await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
  const cheese = await Product.create({
    householdId: household.id,
    name: 'Emmental',
    defaultUnit: 'g',
  })
  return { user, household, pasta, cheese }
}

test.group('Recipes | CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a recipe with ingredients and substitutes', async ({ client, assert }) => {
    const { user, household, pasta, cheese } = await setup()
    const mozzarella = await Product.create({
      householdId: household.id,
      name: 'Mozzarella',
      defaultUnit: 'g',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Pâtes au fromage',
        servings: 4,
        prepMinutes: 10,
        cookMinutes: 15,
        steps: ['Cuire les pâtes', 'Ajouter le fromage'],
        tags: ['rapide', 'végétarien'],
        ingredients: [
          { productId: pasta.id, quantity: 400, unit: 'g' },
          {
            productId: mozzarella.id,
            quantity: 150,
            unit: 'g',
            optional: true,
            substituteProductIds: [cheese.id],
          },
        ],
      })
      .loginAs(user)

    response.assertStatus(201)
    const recipe = response.body().data
    assert.lengthOf(recipe.ingredients, 2)
    assert.equal(recipe.ingredients[0].product.name, 'Pâtes')
    assert.isTrue(recipe.ingredients[1].optional)
    assert.equal(recipe.ingredients[1].substitutes[0].productId, cheese.id)
  })

  test('rejects an ingredient from another household', async ({ client }) => {
    const { user, household } = await setup()
    const other = await User.create({ email: 'paul@example.com', password: 'secret-password' })
    const otherHousehold = await HouseholdService.create(other, { name: 'Ailleurs' })
    const foreign = await Product.create({
      householdId: otherHousehold.id,
      name: 'Truffe',
      defaultUnit: 'g',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Recette pirate',
        ingredients: [{ productId: foreign.id, quantity: 10, unit: 'g' }],
      })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('update replaces ingredients wholesale', async ({ client, assert }) => {
    const { user, household, pasta, cheese } = await setup()
    const create = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Pâtes simples',
        ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
      })
      .loginAs(user)
    const recipeId = create.body().data.id

    const update = await client
      .patch(`/api/v1/households/${household.id}/recipes/${recipeId}`)
      .json({
        ingredients: [
          { productId: pasta.id, quantity: 500, unit: 'g' },
          { productId: cheese.id, quantity: 100, unit: 'g' },
        ],
      })
      .loginAs(user)

    update.assertStatus(200)
    assert.lengthOf(update.body().data.ingredients, 2)
    assert.equal(update.body().data.ingredients[0].quantity, 500)
  })

  test('soft delete hides the recipe from the list', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    const create = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Éphémère',
        ingredients: [{ productId: pasta.id, quantity: 100, unit: 'g' }],
      })
      .loginAs(user)
    const recipeId = create.body().data.id

    const destroy = await client
      .delete(`/api/v1/households/${household.id}/recipes/${recipeId}`)
      .loginAs(user)
    destroy.assertStatus(204)

    const list = await client.get(`/api/v1/households/${household.id}/recipes`).loginAs(user)
    assert.lengthOf(list.body().data, 0)

    /** Row kept in database for planned-meal history (spec 7.16). */
    const stillThere = await Recipe.query().where('id', recipeId).first()
    assert.isNotNull(stillThere)
    assert.isNotNull(stillThere!.deletedAt)
  })

  test('duplicates a recipe with its ingredients', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    const create = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Originale',
        ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
      })
      .loginAs(user)

    const duplicate = await client
      .post(`/api/v1/households/${household.id}/recipes/${create.body().data.id}/duplicate`)
      .loginAs(user)

    duplicate.assertStatus(201)
    assert.equal(duplicate.body().data.name, 'Originale (copie)')
    assert.lengthOf(duplicate.body().data.ingredients, 1)
    assert.notEqual(duplicate.body().data.id, create.body().data.id)
  })

  test('filters by tag', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Rapide',
        tags: ['rapide'],
        ingredients: [{ productId: pasta.id, quantity: 1, unit: 'g' }],
      })
      .loginAs(user)
    await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Lente',
        tags: ['mijoté'],
        ingredients: [{ productId: pasta.id, quantity: 1, unit: 'g' }],
      })
      .loginAs(user)

    const response = await client
      .get(`/api/v1/households/${household.id}/recipes?tag=rapide`)
      .loginAs(user)

    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].name, 'Rapide')
  })
})

test.group('Recipes | feasibility (spec §8.7)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('computes missing quantities scaled to servings (spec 5.10)', async ({ client, assert }) => {
    const { user, household, pasta } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 300, unit: 'g' })

    const create = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Pâtes',
        servings: 4,
        ingredients: [{ productId: pasta.id, quantity: 400, unit: 'g' }],
      })
      .loginAs(user)
    const recipeId = create.body().data.id

    /** For 2 servings: 200 g required, 300 g in stock → feasible. */
    const forTwo = await client
      .get(`/api/v1/households/${household.id}/recipes/${recipeId}/feasibility?servings=2`)
      .loginAs(user)
    assert.isTrue(forTwo.body().data.feasible)
    assert.equal(forTwo.body().data.ingredients[0].required, 200)
    assert.equal(forTwo.body().data.ingredients[0].missing, 0)

    /** For 4 servings: 400 g required, 300 g in stock → 100 g missing. */
    const forFour = await client
      .get(`/api/v1/households/${household.id}/recipes/${recipeId}/feasibility`)
      .loginAs(user)
    assert.isFalse(forFour.body().data.feasible)
    assert.equal(forFour.body().data.ingredients[0].missing, 100)
  })

  test('optional ingredients never block feasibility (spec 5.9)', async ({ client, assert }) => {
    const { user, household, pasta, cheese } = await setup()
    await StockService.addItem(household, user, { productId: pasta.id, quantity: 500, unit: 'g' })

    const create = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Pâtes au fromage optionnel',
        servings: 4,
        ingredients: [
          { productId: pasta.id, quantity: 400, unit: 'g' },
          { productId: cheese.id, quantity: 100, unit: 'g', optional: true },
        ],
      })
      .loginAs(user)

    const response = await client
      .get(`/api/v1/households/${household.id}/recipes/${create.body().data.id}/feasibility`)
      .loginAs(user)

    assert.isTrue(response.body().data.feasible)
    assert.equal(response.body().data.ingredients[1].missing, 100)
  })
})
