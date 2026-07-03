import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

import HouseholdMember from '#models/household_member'
import ActivityLogService from '#services/activity_log_service'
import HouseholdMemberTransformer from '#transformers/household_member_transformer'
import { updateMemberValidator } from '#validators/household'

export default class HouseholdMembersController {
  /** Changes a member's role. Requires admin (enforced by route middleware). */
  async update({ household, params, auth, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateMemberValidator)

    const member = await HouseholdMember.query()
      .where('household_id', household.id)
      .where('id', params.memberId)
      .firstOrFail()

    if (member.role === 'admin' && payload.role !== 'admin') {
      await this.ensureAnotherAdminExists(household.id, member.id)
    }

    member.role = payload.role
    await member.save()
    await member.load('user')

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'household.member_role_changed',
      subjectType: 'household_member',
      subjectId: member.id,
      data: { role: payload.role },
    })

    return serialize(HouseholdMemberTransformer.transform(member))
  }

  /**
   * Removes a member. Admins can remove anyone; a member can always
   * remove itself (leave the household).
   */
  async destroy({ household, membership, params, auth, response }: HttpContext) {
    const member = await HouseholdMember.query()
      .where('household_id', household.id)
      .where('id', params.memberId)
      .firstOrFail()

    const isSelf = member.id === membership.id
    if (!isSelf && membership.role !== 'admin') {
      return response.forbidden({
        errors: [{ code: 'INSUFFICIENT_ROLE', message: 'Only admins can remove other members' }],
      })
    }

    if (member.role === 'admin') {
      await this.ensureAnotherAdminExists(household.id, member.id)
    }

    await member.delete()

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: isSelf ? 'household.member_left' : 'household.member_removed',
      subjectType: 'household_member',
      subjectId: member.id,
    })

    return response.noContent()
  }

  /** A household must always keep at least one admin. */
  private async ensureAnotherAdminExists(householdId: string, excludedMemberId: string) {
    const otherAdmin = await HouseholdMember.query()
      .where('household_id', householdId)
      .where('role', 'admin')
      .whereNot('id', excludedMemberId)
      .first()

    if (!otherAdmin) {
      throw new Exception('Un foyer doit conserver au moins un administrateur', {
        status: 422,
        code: 'LAST_ADMIN',
      })
    }
  }
}
