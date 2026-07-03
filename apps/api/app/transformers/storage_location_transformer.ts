import type StorageLocation from '#models/storage_location'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class StorageLocationTransformer extends BaseTransformer<StorageLocation> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'householdId',
      'name',
      'type',
      'description',
      'position',
    ])
  }
}
