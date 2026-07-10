import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Household from '#models/household'
import MealType from '#models/meal_type'
import Product from '#models/product'
import PushSubscription from '#models/push_subscription'
import StockItem from '#models/stock_item'
import User from '#models/user'
import HouseholdService from '#services/household_service'
import NotificationSchedulerService from '#services/notification_scheduler_service'
import PlanningService from '#services/planning_service'
import PushService from '#services/push_service'
import RecipeService from '#services/recipe_service'
import StockService from '#services/stock_service'
import { toDateTime } from '#helpers/dates'

interface SentPush {
  endpoint: string
  payload: { notification: { title: string; body: string } }
}

async function setup() {
  const user = await User.create({ email: 'jeanne@example.com', password: 'secret-password' })
  const household = await HouseholdService.create(user, { name: 'Maison' })
  const lunch = await MealType.query()
    .where('household_id', household.id)
    .where('name', 'Déjeuner')
    .firstOrFail()
  await PushSubscription.create({
    userId: user.id,
    householdId: household.id,
    endpoint: `https://push.example/${household.id}`,
    p256Dh: 'p256dh-key',
    auth: 'auth-key',
  })
  return { user, household, lunch }
}

test.group('Notifications | scheduler (spec §6.6, 5.20)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let sent: SentPush[]
  let originalDeliver: typeof PushService.deliver
  let originalIsEnabled: typeof PushService.isEnabled

  group.each.setup(() => {
    sent = []
    originalDeliver = PushService.deliver
    originalIsEnabled = PushService.isEnabled
    PushService.isEnabled = () => true
    PushService.deliver = async (subscription, body) => {
      sent.push({ endpoint: subscription.endpoint, payload: JSON.parse(body) })
      return {}
    }
    return () => {
      PushService.deliver = originalDeliver
      PushService.isEnabled = originalIsEnabled
    }
  })

  test('sends a reminder when the meal time has passed', async ({ assert }) => {
    const { user, household, lunch } = await setup()
    const meal = await PlanningService.create(household, user, {
      date: toDateTime(DateTime.now().toISODate()!),
      mealTypeId: lunch.id,
    })

    /** 13 h : le déjeuner de 12 h 30 est passé. */
    await NotificationSchedulerService.processDueMeals(DateTime.now().set({ hour: 13, minute: 0 }))

    assert.lengthOf(sent, 1)
    assert.equal(sent[0].payload.notification.title, 'Repas à valider')

    /** Idempotence : un second tick ne renvoie rien. */
    await NotificationSchedulerService.processDueMeals(DateTime.now().set({ hour: 13, minute: 5 }))
    assert.lengthOf(sent, 1)

    await meal.refresh()
    assert.equal(meal.status, 'planned')
  })

  test('automatic mode validates the meal and consumes the stock (spec 5.20)', async ({
    assert,
  }) => {
    const { user, household, lunch } = await setup()
    household.settings = { automaticMode: true }
    await household.save()

    const pasta = await Product.create({
      householdId: household.id,
      name: 'Pâtes',
      defaultUnit: 'g',
    })
    const lot = await StockService.addItem(household, user, {
      productId: pasta.id,
      quantity: 500,
      unit: 'g',
    })
    const recipe = await RecipeService.create(household, {
      name: 'Pâtes',
      servings: 2,
      ingredients: [{ productId: pasta.id, quantity: 200, unit: 'g' }],
    })
    const meal = await PlanningService.create(household, user, {
      date: toDateTime(DateTime.now().toISODate()!),
      mealTypeId: lunch.id,
      recipes: [{ recipeId: recipe.id, servings: 2 }],
    })

    await NotificationSchedulerService.processDueMeals(DateTime.now().set({ hour: 13, minute: 0 }))

    await meal.refresh()
    assert.equal(meal.status, 'done')
    await lot.refresh()
    assert.equal(lot.quantity, 300)
    assert.equal(sent[0].payload.notification.title, 'Repas validé automatiquement')
  })

  test('sends one expiry digest per household per day', async ({ assert }) => {
    const { user, household } = await setup()
    const salad = await Product.create({
      householdId: household.id,
      name: 'Salade',
      defaultUnit: 'g',
    })
    await StockService.addItem(household, user, {
      productId: salad.id,
      quantity: 100,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 1 }),
    })

    const morning = DateTime.now().set({ hour: 9, minute: 0 })
    await NotificationSchedulerService.processExpiryAlerts(morning)
    assert.lengthOf(sent, 1)
    assert.include(sent[0].payload.notification.body, 'Salade')

    /** Même jour : pas de doublon. */
    await NotificationSchedulerService.processExpiryAlerts(morning.plus({ hours: 2 }))
    assert.lengthOf(sent, 1)

    const fresh = await Household.findOrFail(household.id)
    assert.equal(
      (fresh.settings as { lastExpiryAlertDate?: string }).lastExpiryAlertDate,
      morning.toISODate()
    )
  })

  test('expired push subscriptions are pruned on 410', async ({ assert }) => {
    const { user, household, lunch } = await setup()
    PushService.deliver = async () => {
      const error = new Error('gone') as Error & { statusCode: number }
      error.statusCode = 410
      throw error
    }
    await PlanningService.create(household, user, {
      date: toDateTime(DateTime.now().toISODate()!),
      mealTypeId: lunch.id,
    })

    await NotificationSchedulerService.processDueMeals(DateTime.now().set({ hour: 13 }))

    const remaining = await PushSubscription.query().where('household_id', household.id)
    assert.lengthOf(remaining, 0)
  })

  /** Vérifie que StockItem est bien importé (lot utilisé par l'alerte). */
  test('expiry digest ignores consumed lots', async ({ assert }) => {
    const { user, household } = await setup()
    const salad = await Product.create({
      householdId: household.id,
      name: 'Salade',
      defaultUnit: 'g',
    })
    const lot = await StockService.addItem(household, user, {
      productId: salad.id,
      quantity: 100,
      unit: 'g',
      expiresAt: DateTime.now().plus({ days: 1 }),
    })
    await StockService.consumeItem(lot, user)
    const refreshed = await StockItem.findOrFail(lot.id)
    assert.equal(refreshed.status, 'consumed')

    await NotificationSchedulerService.processExpiryAlerts(DateTime.now().set({ hour: 9 }))

    assert.lengthOf(sent, 0)
  })
})
