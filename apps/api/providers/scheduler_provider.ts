import type { ApplicationService } from '@adonisjs/core/types'

const TICK_INTERVAL_MS = 60_000

/**
 * Minute-based scheduler driving meal reminders, expiry digests and the
 * automatic mode (spec §6.6, 5.20). Disabled in tests — the services are
 * exercised directly there.
 */
export default class SchedulerProvider {
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(protected app: ApplicationService) {}

  async ready() {
    if (this.app.inTest) {
      return
    }

    const { default: NotificationSchedulerService } =
      await import('#services/notification_scheduler_service')

    this.timer = setInterval(() => {
      void NotificationSchedulerService.tick()
    }, TICK_INTERVAL_MS)
    /** Never keep the process alive just for the scheduler. */
    this.timer.unref?.()
  }

  async shutdown() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
