import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import HouseholdMember from '#models/household_member'
import User from '#models/user'
import HouseholdService from '#services/household_service'

async function createUser(email: string) {
  return User.create({ email, password: 'secret-password' })
}

test.group('Households | creation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a household with creator as admin and seeded defaults', async ({
    client,
    assert,
  }) => {
    const user = await createUser('jeanne@example.com')

    const response = await client.post('/api/v1/households').json({ name: 'Maison' }).loginAs(user)

    response.assertStatus(201)
    const household = response.body().data
    assert.equal(household.name, 'Maison')
    // Seeded defaults: 3 storage locations, 3 meal types (spec §4.6, §4.1)
    assert.lengthOf(household.storageLocations, 3)
    assert.lengthOf(household.mealTypes, 3)

    const membership = await HouseholdMember.query()
      .where('household_id', household.id)
      .where('user_id', user.id)
      .firstOrFail()
    assert.equal(membership.role, 'admin')
  })

  test('lists only the households the user belongs to', async ({ client, assert }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    await HouseholdService.create(jeanne, { name: 'Maison Jeanne' })
    await HouseholdService.create(paul, { name: 'Maison Paul' })

    const response = await client.get('/api/v1/households').loginAs(jeanne)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 1)
    assert.equal(response.body().data[0].household.name, 'Maison Jeanne')
    assert.equal(response.body().data[0].role, 'admin')
  })

  test('returns 404 for a household the user is not a member of', async ({ client }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    const household = await HouseholdService.create(paul, { name: 'Maison Paul' })

    const response = await client.get(`/api/v1/households/${household.id}`).loginAs(jeanne)

    response.assertStatus(404)
  })
})

test.group('Households | update and roles', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('allows an admin to rename the household', async ({ client, assert }) => {
    const jeanne = await createUser('jeanne@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })

    const response = await client
      .patch(`/api/v1/households/${household.id}`)
      .json({ name: 'Chez nous' })
      .loginAs(jeanne)

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Chez nous')
  })

  test('forbids a plain member from renaming the household', async ({ client }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })
    await HouseholdMember.create({ householdId: household.id, userId: paul.id, role: 'member' })

    const response = await client
      .patch(`/api/v1/households/${household.id}`)
      .json({ name: 'Piraté' })
      .loginAs(paul)

    response.assertStatus(403)
  })
})

test.group('Households | invitations', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('lets a user join a household with a valid code', async ({ client, assert }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })

    const invitationResponse = await client
      .post(`/api/v1/households/${household.id}/invitations`)
      .json({})
      .loginAs(jeanne)
    invitationResponse.assertStatus(201)
    const code = invitationResponse.body().data.code

    const joinResponse = await client.post('/api/v1/invitations/join').json({ code }).loginAs(paul)

    joinResponse.assertStatus(200)
    assert.equal(joinResponse.body().data.household.id, household.id)
    assert.equal(joinResponse.body().data.role, 'member')
    assert.isFalse(joinResponse.body().data.alreadyMember)
  })

  test('rejects an unknown or revoked code', async ({ client }) => {
    const paul = await createUser('paul@example.com')

    const response = await client
      .post('/api/v1/invitations/join')
      .json({ code: 'UNKNOWN9' })
      .loginAs(paul)

    response.assertStatus(422)
  })

  test('forbids a member from creating invitations', async ({ client }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })
    await HouseholdMember.create({ householdId: household.id, userId: paul.id, role: 'member' })

    const response = await client
      .post(`/api/v1/households/${household.id}/invitations`)
      .json({})
      .loginAs(paul)

    response.assertStatus(403)
  })
})

test.group('Households | members', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('prevents demoting the last admin', async ({ client }) => {
    const jeanne = await createUser('jeanne@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })
    const membership = await HouseholdMember.query()
      .where('household_id', household.id)
      .firstOrFail()

    const response = await client
      .patch(`/api/v1/households/${household.id}/members/${membership.id}`)
      .json({ role: 'member' })
      .loginAs(jeanne)

    response.assertStatus(422)
  })

  test('lets a member leave the household', async ({ client, assert }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })
    const paulMembership = await HouseholdMember.create({
      householdId: household.id,
      userId: paul.id,
      role: 'member',
    })

    const response = await client
      .delete(`/api/v1/households/${household.id}/members/${paulMembership.id}`)
      .loginAs(paul)

    response.assertStatus(204)
    const remaining = await HouseholdMember.query().where('id', paulMembership.id).first()
    assert.isNull(remaining)
  })

  test('forbids a member from removing someone else', async ({ client }) => {
    const jeanne = await createUser('jeanne@example.com')
    const paul = await createUser('paul@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })
    await HouseholdMember.create({ householdId: household.id, userId: paul.id, role: 'member' })
    const jeanneMembership = await HouseholdMember.query()
      .where('household_id', household.id)
      .where('user_id', jeanne.id)
      .firstOrFail()

    const response = await client
      .delete(`/api/v1/households/${household.id}/members/${jeanneMembership.id}`)
      .loginAs(paul)

    response.assertStatus(403)
  })
})

test.group('Households | storage locations', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates, updates and deletes a storage location', async ({ client, assert }) => {
    const jeanne = await createUser('jeanne@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })

    const created = await client
      .post(`/api/v1/households/${household.id}/storage-locations`)
      .json({ name: 'Cave à vin', type: 'cellar' })
      .loginAs(jeanne)
    created.assertStatus(201)
    const locationId = created.body().data.id

    const updated = await client
      .patch(`/api/v1/households/${household.id}/storage-locations/${locationId}`)
      .json({ name: 'Cave' })
      .loginAs(jeanne)
    updated.assertStatus(200)
    assert.equal(updated.body().data.name, 'Cave')

    const deleted = await client
      .delete(`/api/v1/households/${household.id}/storage-locations/${locationId}`)
      .loginAs(jeanne)
    deleted.assertStatus(204)
  })

  test('forbids a viewer from creating a storage location', async ({ client }) => {
    const jeanne = await createUser('jeanne@example.com')
    const lea = await createUser('lea@example.com')
    const household = await HouseholdService.create(jeanne, { name: 'Maison' })
    await HouseholdMember.create({ householdId: household.id, userId: lea.id, role: 'viewer' })

    const response = await client
      .post(`/api/v1/households/${household.id}/storage-locations`)
      .json({ name: 'Placard secret' })
      .loginAs(lea)

    response.assertStatus(403)
  })
})
