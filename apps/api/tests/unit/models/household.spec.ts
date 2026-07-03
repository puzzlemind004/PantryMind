import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Household from '#models/household'
import HouseholdMember from '#models/household_member'
import StorageLocation from '#models/storage_location'
import User from '#models/user'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

test.group('Models | household core', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('assigns UUID primary keys on creation', async ({ assert }) => {
    const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
    const household = await Household.create({ name: 'Maison principale' })

    assert.match(user.id, UUID_PATTERN)
    assert.match(household.id, UUID_PATTERN)
  })

  test('links users to households through members with a role', async ({ assert }) => {
    const user = await User.create({ email: 'paul@example.com', password: 'secret-password' })
    const household = await Household.create({ name: 'Coloc' })

    await HouseholdMember.create({ householdId: household.id, userId: user.id, role: 'admin' })

    await household.load('members', (query) => query.preload('user'))
    assert.lengthOf(household.members, 1)
    assert.equal(household.members[0].role, 'admin')
    assert.equal(household.members[0].user.email, 'paul@example.com')
  })

  test('cascades storage locations deletion with the household', async ({ assert }) => {
    const household = await Household.create({ name: 'Maison' })
    await StorageLocation.create({ householdId: household.id, name: 'Frigo', type: 'fridge' })

    await household.delete()

    const remaining = await StorageLocation.query().where('household_id', household.id)
    assert.lengthOf(remaining, 0)
  })
})
