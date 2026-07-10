import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

import Household from '#models/household'
import PlannedMeal from '#models/planned_meal'
import StockItem from '#models/stock_item'
import MealValidationService from '#services/meal_validation_service'
import PushService from '#services/push_service'

const EXPIRY_ALERT_HOUR = 8
const EXPIRY_ALERT_DAYS = 2

/**
 * Periodic jobs behind the notification module (spec §6.6) and the
 * automatic mode (spec 5.20). Called by the scheduler provider every
 * minute; every method is idempotent (notified_at, settings marker).
 */
export default class NotificationSchedulerService {
  static async tick(now = DateTime.now()) {
    try {
      await this.processDueMeals(now)
      await this.processExpiryAlerts(now)
    } catch (error) {
      logger.error({ err: error }, 'notification scheduler tick failed')
    }
  }

  /**
   * Meals whose effective time has passed: automatic mode validates them
   * with the theoretical quantities (spec 5.20), otherwise the household
   * gets a "meal to validate" reminder (spec 5.2).
   */
  static async processDueMeals(now = DateTime.now()) {
    const meals = await PlannedMeal.query()
      .where('status', 'planned')
      .whereNull('notified_at')
      .where('date', '<=', now.toISODate()!)
      .preload('mealType')
      .preload('household')

    for (const meal of meals) {
      const time = meal.effectiveTime ?? '12:00'
      const dueAt = DateTime.fromISO(`${meal.date.toISODate()}T${time}`)
      if (dueAt > now) {
        continue
      }

      meal.notifiedAt = now
      await meal.save()

      const automaticMode = meal.household.settings?.automaticMode === true
      if (automaticMode) {
        try {
          await MealValidationService.complete(meal, meal.household, null, {
            version: meal.version,
          })
          await PushService.sendToHousehold(meal.householdId, {
            title: 'Repas validé automatiquement',
            body: `${meal.mealName} a été validé, le stock est à jour.`,
            url: '/planning',
          })
        } catch (error) {
          logger.warn({ err: error, mealId: meal.id }, 'automatic meal validation failed')
        }
      } else {
        await PushService.sendToHousehold(meal.householdId, {
          title: 'Repas à valider',
          body: `${meal.mealName} était prévu à ${time}. Validez-le pour mettre le stock à jour.`,
          url: '/planning',
        })
      }
    }
  }

  /**
   * Daily morning digest of lots expiring soon (spec §6.6), one per
   * household per day (marker in household settings).
   */
  static async processExpiryAlerts(now = DateTime.now()) {
    if (now.hour < EXPIRY_ALERT_HOUR) {
      return
    }
    const today = now.toISODate()!
    const horizon = now.plus({ days: EXPIRY_ALERT_DAYS }).toISODate()!

    const households = await Household.query().whereRaw(
      `coalesce(settings->>'lastExpiryAlertDate', '') <> ?`,
      [today]
    )

    for (const household of households) {
      const expiring = await StockItem.query()
        .where('household_id', household.id)
        .where('status', 'available')
        .whereNotNull('expires_at')
        .where('expires_at', '<=', horizon)
        .preload('product')

      household.settings = { ...household.settings, lastExpiryAlertDate: today } as never
      await household.save()

      if (expiring.length === 0) {
        continue
      }

      const names = [...new Set(expiring.map((lot) => lot.product.name))]
      const preview = names.slice(0, 3).join(', ')
      await PushService.sendToHousehold(household.id, {
        title: 'Produits à consommer rapidement',
        body:
          names.length > 3
            ? `${preview} et ${names.length - 3} autre(s) périment sous ${EXPIRY_ALERT_DAYS} jours.`
            : `${preview} périme(nt) sous ${EXPIRY_ALERT_DAYS} jours.`,
        url: '/stock',
      })
    }
  }
}
