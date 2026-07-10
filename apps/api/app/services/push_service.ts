import webpush from 'web-push'
import logger from '@adonisjs/core/services/logger'

import env from '#start/env'
import PushSubscription from '#models/push_subscription'

export interface PushPayload {
  title: string
  body: string
  /** In-app path opened when the notification is tapped. */
  url?: string
}

let vapidConfigured: boolean | null = null

function ensureConfigured(): boolean {
  if (vapidConfigured !== null) {
    return vapidConfigured
  }
  const publicKey = env.get('VAPID_PUBLIC_KEY')
  const privateKey = env.get('VAPID_PRIVATE_KEY')
  if (!publicKey || !privateKey) {
    logger.warn('VAPID keys missing — push notifications are disabled')
    vapidConfigured = false
    return false
  }
  webpush.setVapidDetails(
    env.get('VAPID_SUBJECT', 'mailto:contact@puzzlemind.fr'),
    publicKey,
    privateKey
  )
  vapidConfigured = true
  return true
}

/**
 * Web Push delivery (spec §6.6). Payload uses the Angular service
 * worker "notification" format so the PWA displays it natively.
 * Expired subscriptions (404/410) are pruned automatically.
 */
export default class PushService {
  /** Overridable in tests. */
  static deliver: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    body: string
  ) => Promise<unknown> = (subscription, body) => webpush.sendNotification(subscription, body)

  /** Overridable in tests (bypasses the real VAPID validation). */
  static isEnabled: () => boolean = ensureConfigured

  static publicKey(): string | null {
    return env.get('VAPID_PUBLIC_KEY') ?? null
  }

  static async sendToHousehold(householdId: string, payload: PushPayload) {
    if (!this.isEnabled()) {
      return { sent: 0 }
    }

    const subscriptions = await PushSubscription.query().where('household_id', householdId)
    let sent = 0

    for (const subscription of subscriptions) {
      try {
        await this.deliver(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256Dh, auth: subscription.auth },
          },
          JSON.stringify({
            notification: {
              title: payload.title,
              body: payload.body,
              icon: 'icons/icon-192x192.png',
              data: {
                onActionClick: {
                  default: { operation: 'navigateLastFocusedOrOpen', url: payload.url ?? '/' },
                },
              },
            },
          })
        )
        sent += 1
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await subscription.delete()
        } else {
          logger.warn({ err: error }, 'push delivery failed')
        }
      }
    }

    return { sent }
  }
}
