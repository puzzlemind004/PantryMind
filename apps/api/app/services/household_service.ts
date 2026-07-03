import { randomBytes } from 'node:crypto'

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'

import Household from '#models/household'
import HouseholdInvitation from '#models/household_invitation'
import HouseholdMember from '#models/household_member'
import MealType from '#models/meal_type'
import StorageLocation from '#models/storage_location'
import ActivityLogService from '#services/activity_log_service'
import type User from '#models/user'
import type { HouseholdRole } from '#types/household'

/** Defaults seeded at household creation, freely editable afterwards. */
const DEFAULT_STORAGE_LOCATIONS = [
  { name: 'Frigo', type: 'fridge' as const, position: 0 },
  { name: 'Congélateur', type: 'freezer' as const, position: 1 },
  { name: 'Placard', type: 'pantry' as const, position: 2 },
]

/** Default meal times, household-configurable (spec §4.1, 5.2). */
const DEFAULT_MEAL_TYPES = [
  { name: 'Petit-déjeuner', defaultTime: '08:00', position: 0 },
  { name: 'Déjeuner', defaultTime: '12:30', position: 1 },
  { name: 'Dîner', defaultTime: '19:30', position: 2 },
]

/** Unambiguous alphabet (no 0/O, 1/I/L) for shareable invitation codes. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8
const INVITATION_LIFETIME_DAYS = 7

export default class HouseholdService {
  /**
   * Creates a household with its creator as admin and seeds the default
   * storage locations and meal types.
   */
  static async create(user: User, payload: { name: string }) {
    return db.transaction(async (trx) => {
      const household = await Household.create({ name: payload.name }, { client: trx })

      await HouseholdMember.create(
        { householdId: household.id, userId: user.id, role: 'admin' },
        { client: trx }
      )

      await StorageLocation.createMany(
        DEFAULT_STORAGE_LOCATIONS.map((location) => ({ ...location, householdId: household.id })),
        { client: trx }
      )

      await MealType.createMany(
        DEFAULT_MEAL_TYPES.map((mealType) => ({ ...mealType, householdId: household.id })),
        { client: trx }
      )

      await ActivityLogService.record({
        householdId: household.id,
        userId: user.id,
        action: 'household.created',
        subjectType: 'household',
        subjectId: household.id,
        trx,
      })

      return household
    })
  }

  /**
   * Creates a shareable invitation code (spec §10.3).
   */
  static async createInvitation(
    household: Household,
    inviter: User,
    options: { role?: HouseholdRole } = {}
  ) {
    return HouseholdInvitation.create({
      householdId: household.id,
      createdBy: inviter.id,
      code: this.generateCode(),
      role: options.role ?? 'member',
      expiresAt: DateTime.now().plus({ days: INVITATION_LIFETIME_DAYS }),
    })
  }

  /**
   * Joins a household using an invitation code. Idempotent for users who
   * are already members of the target household.
   */
  static async joinByCode(user: User, code: string) {
    const invitation = await HouseholdInvitation.query()
      .where('code', code.trim().toUpperCase())
      .preload('household')
      .first()

    if (!invitation || !invitation.isUsable) {
      throw new Exception('Invitation invalide ou expirée', {
        status: 422,
        code: 'INVALID_INVITATION',
      })
    }

    const existing = await HouseholdMember.query()
      .where('household_id', invitation.householdId)
      .where('user_id', user.id)
      .first()

    if (existing) {
      return { household: invitation.household, membership: existing, alreadyMember: true }
    }

    const membership = await HouseholdMember.create({
      householdId: invitation.householdId,
      userId: user.id,
      role: invitation.role,
    })

    await ActivityLogService.record({
      householdId: invitation.householdId,
      userId: user.id,
      action: 'household.member_joined',
      subjectType: 'household_member',
      subjectId: membership.id,
      data: { invitationId: invitation.id },
    })

    return { household: invitation.household, membership, alreadyMember: false }
  }

  private static generateCode() {
    const bytes = randomBytes(CODE_LENGTH)
    let code = ''
    for (let index = 0; index < CODE_LENGTH; index++) {
      code += CODE_ALPHABET[bytes[index] % CODE_ALPHABET.length]
    }
    return code
  }
}
