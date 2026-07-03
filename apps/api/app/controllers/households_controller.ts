import type { HttpContext } from '@adonisjs/core/http'

import HouseholdMember from '#models/household_member'
import ActivityLogService from '#services/activity_log_service'
import HouseholdService from '#services/household_service'
import HouseholdMembershipTransformer from '#transformers/household_membership_transformer'
import HouseholdTransformer from '#transformers/household_transformer'
import { createHouseholdValidator, updateHouseholdValidator } from '#validators/household'

export default class HouseholdsController {
  /** Lists the households the authenticated user belongs to, with their role. */
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const memberships = await HouseholdMember.query()
      .where('user_id', user.id)
      .preload('household')
      .orderBy('created_at', 'asc')

    return serialize(HouseholdMembershipTransformer.transform(memberships))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createHouseholdValidator)

    const household = await HouseholdService.create(user, payload)
    await household.load('storageLocations')
    await household.load('mealTypes')

    response.status(201)
    return serialize(HouseholdTransformer.transform(household))
  }

  async show({ household, membership, serialize }: HttpContext) {
    await household.load('members', (query) => query.preload('user').orderBy('created_at', 'asc'))
    await household.load('storageLocations', (query) => query.orderBy('position', 'asc'))
    await household.load('mealTypes', (query) => query.orderBy('position', 'asc'))

    return serialize(HouseholdMembershipTransformer.transform(membership))
  }

  async update({ household, auth, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateHouseholdValidator)

    household.merge({
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.settings !== undefined
        ? { settings: { ...household.settings, ...payload.settings } }
        : {}),
    })
    await household.save()

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'household.updated',
      subjectType: 'household',
      subjectId: household.id,
      data: payload,
    })

    return serialize(HouseholdTransformer.transform(household))
  }
}
