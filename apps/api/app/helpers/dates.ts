import { DateTime } from 'luxon'

/**
 * VineJS date() output is typed DateTime but arrives as an ISO string or
 * Date at runtime — normalize defensively.
 */
export function toDateTime(value: unknown): DateTime {
  if (DateTime.isDateTime(value)) {
    return value
  }
  if (value instanceof Date) {
    return DateTime.fromJSDate(value)
  }
  return DateTime.fromISO(String(value))
}
