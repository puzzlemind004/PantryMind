import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import ProductReference from '#models/product_reference'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import OpenFoodFactsService from '#services/open_food_facts_service'

async function setupHousehold(email = 'jeanne@example.com') {
  const user = await User.create({ email, password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  return { user, household }
}

test.group('Catalog | products', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a household product', async ({ client, assert }) => {
    const { user, household } = await setupHousehold()

    const response = await client
      .post(`/api/v1/households/${household.id}/products`)
      .json({ name: 'Riz basmati', category: 'Féculents', defaultUnit: 'g' })
      .loginAs(user)

    response.assertStatus(201)
    assert.equal(response.body().data.name, 'Riz basmati')
    assert.isFalse(response.body().data.isGlobal)
  })

  test('search returns own products and global catalogue, not other households', async ({
    client,
    assert,
  }) => {
    const { user, household } = await setupHousehold()
    const other = await setupHousehold('paul@example.com')

    await Product.create({ householdId: household.id, name: 'Riz basmati', defaultUnit: 'g' })
    await Product.create({ householdId: null, name: 'Riz thaï', defaultUnit: 'g' })
    await Product.create({ householdId: other.household.id, name: 'Riz noir', defaultUnit: 'g' })

    const response = await client
      .get(`/api/v1/households/${household.id}/products?search=riz`)
      .loginAs(user)

    response.assertStatus(200)
    const names = response.body().data.map((product: { name: string }) => product.name)
    assert.sameMembers(names, ['Riz basmati', 'Riz thaï'])
  })

  test('refuses to edit a global catalogue product', async ({ client }) => {
    const { user, household } = await setupHousehold()
    const globalProduct = await Product.create({
      householdId: null,
      name: 'Lait',
      defaultUnit: 'ml',
    })

    const response = await client
      .patch(`/api/v1/households/${household.id}/products/${globalProduct.id}`)
      .json({ name: 'Lait modifié' })
      .loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Catalog | references and barcode', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let originalFetchJson: typeof OpenFoodFactsService.fetchJson

  group.each.setup(() => {
    originalFetchJson = OpenFoodFactsService.fetchJson
    return () => {
      OpenFoodFactsService.fetchJson = originalFetchJson
    }
  })

  test('creates a reference together with its generic product', async ({ client, assert }) => {
    const { user, household } = await setupHousehold()

    const response = await client
      .post(`/api/v1/households/${household.id}/product-references`)
      .json({
        newProduct: { name: 'Pâtes', category: 'Féculents', defaultUnit: 'g' },
        barcode: '3038350208804',
        name: 'Penne rigate 500g',
        brand: 'Panzani',
        packageQuantity: 500,
        packageUnit: 'g',
      })
      .loginAs(user)

    response.assertStatus(201)
    assert.equal(response.body().data.reference.barcode, '3038350208804')
    assert.equal(response.body().data.product.name, 'Pâtes')

    const product = await Product.findOrFail(response.body().data.product.id)
    assert.equal(product.householdId, household.id)
  })

  test('barcode lookup finds a local reference first', async ({ client, assert }) => {
    const { user, household } = await setupHousehold()
    const product = await Product.create({ householdId: null, name: 'Pâtes', defaultUnit: 'g' })
    await ProductReference.create({
      productId: product.id,
      barcode: '3038350208804',
      name: 'Penne rigate 500g',
      source: 'manual',
    })

    /** Must not be called for a local hit. */
    OpenFoodFactsService.fetchJson = async () => {
      throw new Error('OFF should not be queried')
    }

    const response = await client
      .get(`/api/v1/households/${household.id}/barcode/3038350208804`)
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'local')
    assert.equal(response.body().data.product.name, 'Pâtes')
  })

  test('barcode lookup falls back to Open Food Facts', async ({ client, assert }) => {
    const { user, household } = await setupHousehold()

    OpenFoodFactsService.fetchJson = async () => ({
      status: 200,
      json: {
        status: 1,
        product: {
          product_name_fr: 'Lait demi-écrémé',
          brands: 'Lactel, Groupe',
          product_quantity: '1000',
          product_quantity_unit: 'ml',
          image_front_url: 'https://images.openfoodfacts.org/lait.jpg',
          nutriments: { 'energy-kcal_100g': 46, 'proteins_100g': 3.2 },
          categories_tags: ['en:milks'],
          allergens_tags: ['en:milk'],
        },
      },
    })

    const response = await client
      .get(`/api/v1/households/${household.id}/barcode/3155250349793`)
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'external')
    assert.equal(response.body().data.external.name, 'Lait demi-écrémé')
    assert.equal(response.body().data.external.brand, 'Lactel')
    assert.equal(response.body().data.external.nutritionPer100.kcal, 46)
    assert.deepEqual(response.body().data.external.allergens, ['milk'])
  })

  test('returns 404 for a barcode unknown everywhere', async ({ client }) => {
    const { user, household } = await setupHousehold()

    OpenFoodFactsService.fetchJson = async () => ({ status: 200, json: { status: 0 } })

    const response = await client
      .get(`/api/v1/households/${household.id}/barcode/0000000000000`)
      .loginAs(user)

    response.assertStatus(404)
  })
})
