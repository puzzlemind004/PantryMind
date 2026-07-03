import { randomUUID } from 'node:crypto'

import { BaseModel, beforeCreate } from '@adonisjs/lucid/orm'
import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

/**
 * Assigns an application-generated UUID primary key before insertion.
 * All domain models use UUIDs (no sequential ids exposed by the API).
 */
export function withUuidPrimaryKey<T extends NormalizeConstructor<typeof BaseModel>>(
  superclass: T
) {
  class WithUuidPrimaryKey extends superclass {
    static selfAssignPrimaryKey = true

    @beforeCreate()
    static assignUuidPrimaryKey(model: InstanceType<typeof WithUuidPrimaryKey>) {
      const record = model as { id?: string }
      if (!record.id) {
        record.id = randomUUID()
      }
    }
  }

  return WithUuidPrimaryKey
}
