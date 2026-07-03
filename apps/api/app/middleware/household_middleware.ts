import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import type Household from '#models/household'
import HouseholdMember from '#models/household_member'
import type { HouseholdRole } from '#types/household'

const ROLE_WEIGHT: Record<HouseholdRole, number> = { viewer: 0, member: 1, admin: 2 }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Scopes a route to a household (spec §4.1): resolves the `householdId`
 * route parameter, ensures the authenticated user is a member with a
 * sufficient role, and exposes `ctx.household` / `ctx.membership`.
 *
 * A non-member gets a 404 (not a 403) so household ids are not probeable.
 */
export default class HouseholdMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { role?: HouseholdRole } = {}) {
    const user = ctx.auth.getUserOrFail()
    const householdId = String(ctx.params.householdId ?? '')

    /** Reuse the membership when the middleware is stacked (group + stricter role on a route). */
    const alreadyResolved = ctx.membership?.householdId === householdId ? ctx.membership : null

    const membership =
      alreadyResolved ??
      (UUID_PATTERN.test(householdId)
        ? await HouseholdMember.query()
            .where('household_id', householdId)
            .where('user_id', user.id)
            .preload('household')
            .first()
        : null)

    if (!membership) {
      return ctx.response.notFound({
        errors: [{ code: 'HOUSEHOLD_NOT_FOUND', message: 'Household not found' }],
      })
    }

    const requiredRole = options.role ?? 'viewer'
    if (ROLE_WEIGHT[membership.role] < ROLE_WEIGHT[requiredRole]) {
      return ctx.response.forbidden({
        errors: [{ code: 'INSUFFICIENT_ROLE', message: `Requires the "${requiredRole}" role` }],
      })
    }

    ctx.household = membership.household
    ctx.membership = membership

    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    /** Set by HouseholdMiddleware on household-scoped routes. */
    household: Household
    /** The authenticated user's membership in `household`. */
    membership: HouseholdMember
  }
}
