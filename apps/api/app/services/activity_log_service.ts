import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import ActivityLog from '#models/activity_log'

interface RecordOptions {
  householdId: string
  userId?: string | null
  action: string
  subjectType?: string
  subjectId?: string
  data?: Record<string, unknown>
  trx?: TransactionClientContract
}

/**
 * Append-only activity journal (spec §4.12, §9.8).
 * Stock mutations are traced separately through stock_movements.
 */
export default class ActivityLogService {
  static async record(options: RecordOptions) {
    return ActivityLog.create(
      {
        householdId: options.householdId,
        userId: options.userId ?? null,
        action: options.action,
        subjectType: options.subjectType ?? null,
        subjectId: options.subjectId ?? null,
        data: options.data ?? {},
      },
      { client: options.trx }
    )
  }
}
