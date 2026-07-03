import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#models/user'

test.group('Auth | signup', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates an account and returns a token', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Jeanne Dupont',
      email: 'jeanne@example.com',
      password: 'secret-password',
      passwordConfirmation: 'secret-password',
    })

    response.assertStatus(200)
    assert.equal(response.body().data.user.email, 'jeanne@example.com')
    assert.exists(response.body().data.token)
    assert.notProperty(response.body().data.user, 'password')
  })

  test('rejects an already used email', async ({ client }) => {
    await User.create({ email: 'jeanne@example.com', password: 'secret-password' })

    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Jeanne Bis',
      email: 'jeanne@example.com',
      password: 'secret-password',
      passwordConfirmation: 'secret-password',
    })

    response.assertStatus(422)
  })

  test('rejects mismatched password confirmation', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Jeanne Dupont',
      email: 'jeanne@example.com',
      password: 'secret-password',
      passwordConfirmation: 'other-password',
    })

    response.assertStatus(422)
  })
})

test.group('Auth | login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a token for valid credentials', async ({ client, assert }) => {
    await User.create({ email: 'paul@example.com', password: 'secret-password' })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'paul@example.com',
      password: 'secret-password',
    })

    response.assertStatus(200)
    assert.exists(response.body().data.token)
  })

  test('rejects invalid credentials', async ({ client }) => {
    await User.create({ email: 'paul@example.com', password: 'secret-password' })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'paul@example.com',
      password: 'wrong-password',
    })

    response.assertStatus(400)
  })
})

test.group('Auth | profile & logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('requires authentication to read the profile', async ({ client }) => {
    const response = await client.get('/api/v1/account/profile')

    response.assertStatus(401)
  })

  test('returns the authenticated user profile', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Paul Martin',
      email: 'paul@example.com',
      password: 'secret-password',
    })

    const response = await client.get('/api/v1/account/profile').loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().data.email, 'paul@example.com')
  })

  test('revokes the current token on logout', async ({ client, assert }) => {
    const user = await User.create({ email: 'paul@example.com', password: 'secret-password' })
    const token = await User.accessTokens.create(user)

    const logout = await client
      .post('/api/v1/account/logout')
      .header('Authorization', `Bearer ${token.value!.release()}`)
    logout.assertStatus(200)

    const tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 0)
  })
})
