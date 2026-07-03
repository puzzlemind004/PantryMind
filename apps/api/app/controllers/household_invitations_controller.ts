import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

import HouseholdInvitation from '#models/household_invitation'
import HouseholdService from '#services/household_service'
import HouseholdInvitationTransformer from '#transformers/household_invitation_transformer'
import HouseholdTransformer from '#transformers/household_transformer'
import { createInvitationValidator, joinHouseholdValidator } from '#validators/household'

export default class HouseholdInvitationsController {
  /** Lists usable (non-revoked, non-expired) invitations of the household. */
  async index({ household, serialize }: HttpContext) {
    const invitations = await HouseholdInvitation.query()
      .where('household_id', household.id)
      .whereNull('revoked_at')
      .where('expires_at', '>', DateTime.now().toSQL())
      .orderBy('created_at', 'desc')

    return serialize(HouseholdInvitationTransformer.transform(invitations))
  }

  async store({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createInvitationValidator)

    const invitation = await HouseholdService.createInvitation(household, auth.getUserOrFail(), {
      role: payload.role,
    })

    response.status(201)
    return serialize(HouseholdInvitationTransformer.transform(invitation))
  }

  async destroy({ household, params, response }: HttpContext) {
    const invitation = await HouseholdInvitation.query()
      .where('household_id', household.id)
      .where('id', params.invitationId)
      .firstOrFail()

    invitation.revokedAt = DateTime.now()
    await invitation.save()

    return response.noContent()
  }

  /** Joins a household from an invitation code (not household-scoped). */
  async join({ auth, request, serialize }: HttpContext) {
    const { code } = await request.validateUsing(joinHouseholdValidator)

    const result = await HouseholdService.joinByCode(auth.getUserOrFail(), code)

    return serialize({
      household: HouseholdTransformer.transform(result.household),
      role: result.membership.role,
      alreadyMember: result.alreadyMember,
    })
  }
}
