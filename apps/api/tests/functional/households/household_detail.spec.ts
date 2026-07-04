import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#models/user'
import HouseholdService from '#services/household_service'

test.group('Households | detail serialization', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /**
   * Régression retours utilisateur 2026-07-04 : les collections imbriquées
   * (membership → household → storageLocations/mealTypes/members) étaient
   * perdues par le sérialiseur (imbrication à 3 niveaux non résolue).
   */
  test('show returns nested locations, meal types and members', async ({ client, assert }) => {
    const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
    const household = await HouseholdService.create(user, { name: 'Maison' })

    const response = await client.get(`/api/v1/households/${household.id}`).loginAs(user)

    response.assertStatus(200)
    const data = response.body().data
    assert.lengthOf(data.household.storageLocations, 3)
    assert.lengthOf(data.household.mealTypes, 3)
    assert.equal(data.household.mealTypes[1].defaultTime, '12:30')
    assert.lengthOf(data.household.members, 1)
    assert.equal(data.household.members[0].user.email, 'jeanne@example.com')
  })
})
