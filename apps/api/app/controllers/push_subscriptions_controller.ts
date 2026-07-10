import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

import PushSubscription from '#models/push_subscription'
import PushService from '#services/push_service'

export const subscribeValidator = vine.create({
  endpoint: vine.string().url().maxLength(2048),
  keys: vine.object({
    p256dh: vine.string().maxLength(255),
    auth: vine.string().maxLength(64),
  }),
})

export const unsubscribeValidator = vine.create({
  endpoint: vine.string().url().maxLength(2048),
})

/** Web Push subscriptions per device (spec §6.6). */
export default class PushSubscriptionsController {
  /** VAPID public key needed by the browser to subscribe. */
  async publicKey({ response, serialize }: HttpContext) {
    const key = PushService.publicKey()
    if (!key) {
      return response.notFound({
        errors: [{ code: 'PUSH_DISABLED', message: 'Push notifications are not configured' }],
      })
    }
    return serialize({ publicKey: key })
  }

  /** Idempotent by endpoint: re-subscribing updates the binding. */
  async subscribe({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(subscribeValidator)

    const subscription = await PushSubscription.updateOrCreate(
      { endpoint: payload.endpoint },
      {
        userId: auth.getUserOrFail().id,
        householdId: household.id,
        p256Dh: payload.keys.p256dh,
        auth: payload.keys.auth,
      }
    )

    response.status(201)
    return serialize({ id: subscription.id })
  }

  async unsubscribe({ household, request, response }: HttpContext) {
    const { endpoint } = await request.validateUsing(unsubscribeValidator)

    await PushSubscription.query()
      .where('household_id', household.id)
      .where('endpoint', endpoint)
      .delete()

    return response.noContent()
  }
}
