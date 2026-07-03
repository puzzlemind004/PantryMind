import type { HttpContext } from '@adonisjs/core/http'

import StorageLocation from '#models/storage_location'
import ActivityLogService from '#services/activity_log_service'
import StorageLocationTransformer from '#transformers/storage_location_transformer'
import { storageLocationValidator, updateStorageLocationValidator } from '#validators/household'

export default class StorageLocationsController {
  async index({ household, serialize }: HttpContext) {
    const locations = await StorageLocation.query()
      .where('household_id', household.id)
      .orderBy('position', 'asc')

    return serialize(StorageLocationTransformer.transform(locations))
  }

  async store({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(storageLocationValidator)

    const location = await StorageLocation.create({ ...payload, householdId: household.id })

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'storage_location.created',
      subjectType: 'storage_location',
      subjectId: location.id,
      data: { name: location.name },
    })

    response.status(201)
    return serialize(StorageLocationTransformer.transform(location))
  }

  async update({ household, params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateStorageLocationValidator)

    const location = await StorageLocation.query()
      .where('household_id', household.id)
      .where('id', params.locationId)
      .firstOrFail()

    location.merge(payload)
    await location.save()

    return serialize(StorageLocationTransformer.transform(location))
  }

  async destroy({ household, params, auth, response }: HttpContext) {
    const location = await StorageLocation.query()
      .where('household_id', household.id)
      .where('id', params.locationId)
      .firstOrFail()

    await location.delete()

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'storage_location.deleted',
      subjectType: 'storage_location',
      subjectId: location.id,
      data: { name: location.name },
    })

    return response.noContent()
  }
}
