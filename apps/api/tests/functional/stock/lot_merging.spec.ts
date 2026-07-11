import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import StorageLocation from '#models/storage_location'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import StockService from '#services/stock_service'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const fridge = await StorageLocation.query()
    .where('household_id', household.id)
    .where('type', 'fridge')
    .firstOrFail()
  const pasta = await Product.create({ householdId: household.id, name: 'Pâtes', defaultUnit: 'g' })
  return { user, household, fridge, pasta }
}

test.group('Stock | automatic lot merging (spec 5.23)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('identical lots are merged with a traced movement', async ({ assert }) => {
    const { user, household, fridge, pasta } = await setup()
    const expiry = DateTime.fromISO('2026-12-31')

    const first = await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 500,
      unit: 'g',
      storageLocationId: fridge.id,
      expiresAt: expiry,
    })
    const second = await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 300,
      unit: 'g',
      storageLocationId: fridge.id,
      expiresAt: expiry,
    })

    /** Même lot conservé, quantités additionnées. */
    assert.equal(second.id, first.id)
    assert.equal(second.quantity, 800)

    const lots = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
    assert.lengthOf(lots, 1)

    /** Chaque ajout reste tracé sur le lot conservé. */
    const movements = await StockMovement.query().where('stock_item_id', first.id)
    assert.lengthOf(movements, 2)
    assert.isTrue(movements.some((m) => (m.context as { merged?: boolean }).merged === true))
  })

  test('a different expiry date keeps lots separate (spec 4.5)', async ({ assert }) => {
    const { user, household, fridge, pasta } = await setup()

    await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 500,
      unit: 'g',
      storageLocationId: fridge.id,
      expiresAt: DateTime.fromISO('2026-12-31'),
    })
    await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 300,
      unit: 'g',
      storageLocationId: fridge.id,
      expiresAt: DateTime.fromISO('2027-01-15'),
    })

    const lots = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
    assert.lengthOf(lots, 2)
  })

  test('a different location keeps lots separate', async ({ assert }) => {
    const { user, household, fridge, pasta } = await setup()
    const pantry = await StorageLocation.query()
      .where('household_id', household.id)
      .where('type', 'pantry')
      .firstOrFail()

    await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 500,
      unit: 'g',
      storageLocationId: fridge.id,
    })
    await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 300,
      unit: 'g',
      storageLocationId: pantry.id,
    })

    const lots = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
    assert.lengthOf(lots, 2)
  })

  test('a frozen lot never merges with a fresh addition (spec 5.23)', async ({ assert }) => {
    const { user, household, fridge, pasta } = await setup()
    const freezer = await StorageLocation.query()
      .where('household_id', household.id)
      .where('type', 'freezer')
      .firstOrFail()

    const lot = await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 500,
      unit: 'g',
      storageLocationId: fridge.id,
    })
    await StockService.freezeItem(lot, user, freezer.id)

    /** Nouvel ajout au congélateur avec la même DLC que le lot congelé. */
    await lot.refresh()
    await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 300,
      unit: 'g',
      storageLocationId: freezer.id,
      expiresAt: lot.expiresAt,
    })

    const lots = await StockItem.query()
      .where('household_id', household.id)
      .where('product_id', pasta.id)
    assert.lengthOf(lots, 2)
  })
})
