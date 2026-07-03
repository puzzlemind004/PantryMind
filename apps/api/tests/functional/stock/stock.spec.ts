import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Product from '#models/product'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import StockService from '#services/stock_service'

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const product = await Product.create({
    householdId: household.id,
    name: 'Pâtes',
    defaultUnit: 'g',
  })
  return { user, household, product }
}

test.group('Stock | lifecycle', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('adds a lot and traces an "added" movement', async ({ client, assert }) => {
    const { user, household, product } = await setup()

    const response = await client
      .post(`/api/v1/households/${household.id}/stock-items`)
      .json({ productId: product.id, quantity: 500, unit: 'g', expiresAt: '2026-12-31' })
      .loginAs(user)

    response.assertStatus(201)
    const item = response.body().data
    assert.equal(item.quantity, 500)
    assert.equal(item.status, 'available')
    assert.equal(item.expiresAt, '2026-12-31')

    const movements = await StockMovement.query().where('stock_item_id', item.id)
    assert.lengthOf(movements, 1)
    assert.equal(movements[0].type, 'added')
    assert.equal(movements[0].quantityDelta, 500)
  })

  test('rejects a product from another household', async ({ client }) => {
    const { user, household } = await setup()
    const otherUser = await User.create({ email: 'paul@example.com', password: 'secret-password' })
    const otherHousehold = await HouseholdService.create(otherUser, { name: 'Ailleurs' })
    const foreignProduct = await Product.create({
      householdId: otherHousehold.id,
      name: 'Secret',
      defaultUnit: 'g',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/stock-items`)
      .json({ productId: foreignProduct.id, quantity: 1, unit: 'g' })
      .loginAs(user)

    response.assertStatus(422)
  })

  test('partial consumption decrements, total consumption closes the lot', async ({
    client,
    assert,
  }) => {
    const { user, household, product } = await setup()
    const item = await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 500,
      unit: 'g',
    })

    const partial = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/consume`)
      .json({ quantity: 200 })
      .loginAs(user)
    partial.assertStatus(200)
    assert.equal(partial.body().data.quantity, 300)
    assert.equal(partial.body().data.status, 'available')

    const total = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/consume`)
      .json({})
      .loginAs(user)
    total.assertStatus(200)
    assert.equal(total.body().data.quantity, 0)
    assert.equal(total.body().data.status, 'consumed')
  })

  test('discard traces the reason (spec 5.17)', async ({ client, assert }) => {
    const { user, household, product } = await setup()
    const item = await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 500,
      unit: 'g',
    })

    const response = await client
      .post(`/api/v1/households/${household.id}/stock-items/${item.id}/discard`)
      .json({ reason: 'lost' })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'discarded')

    const movement = await StockMovement.query()
      .where('stock_item_id', item.id)
      .where('type', 'discarded')
      .firstOrFail()
    assert.equal((movement.context as { reason: string }).reason, 'lost')
  })

  test('quantity correction is traced and can revive a lot (spec 7.6)', async ({
    client,
    assert,
  }) => {
    const { user, household, product } = await setup()
    const item = await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 500,
      unit: 'g',
    })
    await StockService.consumeItem(item, user)
    assert.equal(item.status, 'consumed')

    const response = await client
      .patch(`/api/v1/households/${household.id}/stock-items/${item.id}`)
      .json({ quantity: 250 })
      .loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.quantity, 250)
    assert.equal(response.body().data.status, 'available')

    const corrections = await StockMovement.query()
      .where('stock_item_id', item.id)
      .where('type', 'corrected')
    assert.lengthOf(corrections, 1)
  })

  test('viewer can read the stock but not modify it', async ({ client }) => {
    const { user, household, product } = await setup()
    const viewer = await User.create({ email: 'lea@example.com', password: 'secret-password' })
    const { default: HouseholdMember } = await import('#models/household_member')
    await HouseholdMember.create({ householdId: household.id, userId: viewer.id, role: 'viewer' })

    const read = await client.get(`/api/v1/households/${household.id}/stock-items`).loginAs(viewer)
    read.assertStatus(200)

    const write = await client
      .post(`/api/v1/households/${household.id}/stock-items`)
      .json({ productId: product.id, quantity: 1, unit: 'g' })
      .loginAs(viewer)
    write.assertStatus(403)
  })
})

test.group('Stock | filters', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('expiringWithinDays returns urgent lots first', async ({ client, assert }) => {
    const { user, household, product } = await setup()

    await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 1,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 2 }),
    })
    await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 2,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 30 }),
    })
    await StockService.addItem(household, user, { productId: product.id, quantity: 3, unit: 'g' })

    const response = await client
      .get(`/api/v1/households/${household.id}/stock-items?expiringWithinDays=7`)
      .loginAs(user)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].quantity, 1)
  })
})

test.group('Stock | FIFO consumption (spec 5.5)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('consumes lots by closest expiry then entry date', async ({ assert }) => {
    const { user, household, product } = await setup()

    const late = await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 500,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 60 }),
    })
    const soon = await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 300,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 3 }),
    })

    const result = await StockService.consumeProductFifo(household, user, {
      productId: product.id,
      quantity: 400,
      unit: 'g',
    })

    assert.equal(result.missingQuantity, 0)
    assert.lengthOf(result.consumed, 2)
    /** The soon-to-expire lot goes first, fully consumed. */
    assert.equal(result.consumed[0].item.id, soon.id)
    assert.equal(result.consumed[0].quantity, 300)
    assert.equal(result.consumed[1].item.id, late.id)
    assert.equal(result.consumed[1].quantity, 100)

    await soon.refresh()
    await late.refresh()
    assert.equal(soon.status, 'consumed')
    assert.equal(late.quantity, 400)
  })

  test('reports the missing quantity instead of failing (spec 7.5)', async ({ assert }) => {
    const { user, household, product } = await setup()
    await StockService.addItem(household, user, {
      productId: product.id,
      quantity: 100,
      unit: 'g',
    })

    const result = await StockService.consumeProductFifo(household, user, {
      productId: product.id,
      quantity: 250,
      unit: 'g',
    })

    assert.equal(result.missingQuantity, 150)
    assert.lengthOf(result.consumed, 1)
  })

  test('converts units through product factors (spec 5.6)', async ({ assert }) => {
    const user = await User.create({ email: 'paul@example.com', password: 'secret-password' })
    const household = await HouseholdService.create(user, { name: 'Maison' })
    /** 1 egg ≈ 50 g. */
    const eggs = await Product.create({
      householdId: household.id,
      name: 'Œufs',
      defaultUnit: 'unit',
      unitWeightGrams: 50,
    })
    await StockService.addItem(household, user, { productId: eggs.id, quantity: 6, unit: 'unit' })

    /** A recipe asks for 150 g of eggs → 3 eggs. */
    const result = await StockService.consumeProductFifo(household, user, {
      productId: eggs.id,
      quantity: 150,
      unit: 'g',
    })

    assert.equal(result.missingQuantity, 0)
    assert.equal(result.consumed[0].quantity, 3)
  })
})
