import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import User from '#models/user'
import HouseholdService from '#services/household_service'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  return { user, household }
}

test.group('Products | kinds (spec 5.21)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a non-food product usable in stock and shopping', async ({ client, assert }) => {
    const { user, household } = await setup()

    const created = await client
      .post(`/api/v1/households/${household.id}/products`)
      .json({ name: 'Litière', kind: 'pet', defaultUnit: 'kg' })
      .loginAs(user)
    created.assertStatus(201)
    assert.equal(created.body().data.kind, 'pet')
    const litterId = created.body().data.id

    /** Stock accepte le non-alimentaire. */
    const stocked = await client
      .post(`/api/v1/households/${household.id}/stock-items`)
      .json({ productId: litterId, quantity: 5, unit: 'kg' })
      .loginAs(user)
    stocked.assertStatus(201)

    /** La liste de courses aussi (ajout manuel). */
    const shopped = await client
      .post(`/api/v1/households/${household.id}/shopping-list/items`)
      .json({ productId: litterId, quantity: 5, unit: 'kg' })
      .loginAs(user)
    shopped.assertStatus(201)
  })

  test('recipes reject non-food ingredients (spec 5.21)', async ({ client, assert }) => {
    const { user, household } = await setup()
    const litter = await Product.create({
      householdId: household.id,
      name: 'Litière',
      kind: 'pet',
      defaultUnit: 'kg',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Recette du chat',
        ingredients: [{ productId: litter.id, quantity: 1, unit: 'kg' }],
      })
      .loginAs(user)

    response.assertStatus(422)
    assert.equal(response.body().errors?.[0]?.code ?? response.body().code, 'NON_FOOD_INGREDIENT')
  })

  test('recipes reject non-food substitutes too', async ({ client }) => {
    const { user, household } = await setup()
    const pasta = await Product.create({
      householdId: household.id,
      name: 'Pâtes',
      defaultUnit: 'g',
    })
    const soap = await Product.create({
      householdId: household.id,
      name: 'Savon',
      kind: 'hygiene',
      defaultUnit: 'unit',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/recipes`)
      .json({
        name: 'Pâtes au savon',
        ingredients: [
          { productId: pasta.id, quantity: 200, unit: 'g', substituteProductIds: [soap.id] },
        ],
      })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('the product search filters by kind (recipe picker)', async ({ client, assert }) => {
    const { user, household } = await setup()
    await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
    await Product.create({
      householdId: household.id,
      name: 'Litière',
      kind: 'pet',
      defaultUnit: 'kg',
    })

    const all = await client.get(`/api/v1/households/${household.id}/products`).loginAs(user)
    assert.lengthOf(all.body().data, 2)

    const foodOnly = await client
      .get(`/api/v1/households/${household.id}/products?kind=food`)
      .loginAs(user)
    assert.lengthOf(foodOnly.body().data, 1)
    assert.equal(foodOnly.body().data[0].name, 'Pâtes')
  })
})
