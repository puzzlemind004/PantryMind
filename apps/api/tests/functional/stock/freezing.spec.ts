import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import StockMovement from '#models/stock_movement'
import StorageLocation from '#models/storage_location'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import StockService from '#services/stock_service'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const freezer = await StorageLocation.query()
    .where('household_id', household.id)
    .where('type', 'freezer')
    .firstOrFail()
  const meat = await Product.create({
    householdId: household.id,
    name: 'Poulet',
    defaultUnit: 'g',
    freezeShelfLifeDays: 120,
  })
  return { user, household, freezer, meat }
}

test.group('Stock | freezing (spec 5.22)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('freezing moves the lot to the freezer and recomputes the expiry', async ({
    client,
    assert,
  }) => {
    const { user, household, freezer, meat } = await setup()
    const item = await StockService.addItem(household, user, {
      productId: meat.id,
      quantity: 500,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 2 }),
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/freeze`)
      .json({})
      .loginAs(user)

    response.assertStatus(200)
    const frozen = response.body().data
    assert.equal(frozen.storageLocationId, freezer.id)
    assert.isNotNull(frozen.frozenAt)
    /** DLC = aujourd'hui + 120 j (durée propre au produit). */
    assert.equal(frozen.expiresAt, DateTime.now().plus({ days: 120 }).toISODate())

    /** Traçabilité complète (spec 5.22.3). */
    const movement = await StockMovement.query()
      .where('stock_item_id', item.id)
      .where('type', 'frozen')
      .firstOrFail()
    const context = movement.context as { previousExpiresAt: string; freezeDays: number }
    assert.equal(context.previousExpiresAt, DateTime.now().plus({ days: 2 }).toISODate())
    assert.equal(context.freezeDays, 120)
  })

  test('falls back to the 90-day default without product-specific value', async ({
    client,
    assert,
  }) => {
    const { user, household } = await setup()
    const bread = await Product.create({
      householdId: household.id,
      name: 'Pain',
      defaultUnit: 'unit',
    })
    const item = await StockService.addItem(household, user, {
      productId: bread.id,
      quantity: 1,
      unit: 'unit',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/freeze`)
      .json({})
      .loginAs(user)

    assert.equal(response.body().data.expiresAt, DateTime.now().plus({ days: 90 }).toISODate())
  })

  test('a frozen lot cannot be re-frozen (spec 5.22)', async ({ client }) => {
    const { user, household, meat } = await setup()
    const item = await StockService.addItem(household, user, {
      productId: meat.id,
      quantity: 500,
      unit: 'g',
    })

    const first = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/freeze`)
      .json({})
      .loginAs(user)
    first.assertStatus(200)

    const second = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/freeze`)
      .json({})
      .loginAs(user)
    second.assertStatus(422)
  })

  test('freezing requires a freezer location (spec 5.22)', async ({ client }) => {
    const { user, household, freezer, meat } = await setup()
    /** Le foyer perd son congélateur. */
    await freezer.delete()
    const item = await StockService.addItem(household, user, {
      productId: meat.id,
      quantity: 500,
      unit: 'g',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/freeze`)
      .json({})
      .loginAs(user)

    response.assertStatus(422)
  })
})
