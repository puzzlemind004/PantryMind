/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    /**
     * Households (spec §4.1) — creation, listing and joining by code.
     */
    router
      .group(() => {
        router.get('households', [controllers.Households, 'index'])
        router.post('households', [controllers.Households, 'store'])
        router.post('invitations/join', [controllers.HouseholdInvitations, 'join'])
      })
      .as('households')
      .use(middleware.auth())

    /**
     * Household-scoped resources. The household middleware checks
     * membership and role, and hydrates ctx.household / ctx.membership.
     */
    router
      .group(() => {
        router.get('', [controllers.Households, 'show'])
        router
          .patch('', [controllers.Households, 'update'])
          .use(middleware.household({ role: 'admin' }))

        // Invitations (admin only)
        router
          .group(() => {
            router.get('invitations', [controllers.HouseholdInvitations, 'index'])
            router.post('invitations', [controllers.HouseholdInvitations, 'store'])
            router.delete('invitations/:invitationId', [
              controllers.HouseholdInvitations,
              'destroy',
            ])
          })
          .use(middleware.household({ role: 'admin' }))

        // Members: role change is admin-only, removal handles self-leave itself
        router
          .patch('members/:memberId', [controllers.HouseholdMembers, 'update'])
          .use(middleware.household({ role: 'admin' }))
        router.delete('members/:memberId', [controllers.HouseholdMembers, 'destroy'])

        // Storage locations (spec §4.6)
        router.get('storage-locations', [controllers.StorageLocations, 'index'])
        router
          .group(() => {
            router.post('storage-locations', [controllers.StorageLocations, 'store'])
            router.patch('storage-locations/:locationId', [controllers.StorageLocations, 'update'])
            router.delete('storage-locations/:locationId', [
              controllers.StorageLocations,
              'destroy',
            ])
          })
          .use(middleware.household({ role: 'member' }))

        // Meal types with default times (spec §4.1)
        router.get('meal-types', [controllers.MealTypes, 'index'])
        router
          .group(() => {
            router.post('meal-types', [controllers.MealTypes, 'store'])
            router.patch('meal-types/:mealTypeId', [controllers.MealTypes, 'update'])
            router.delete('meal-types/:mealTypeId', [controllers.MealTypes, 'destroy'])
          })
          .use(middleware.household({ role: 'member' }))

        // Product catalogue (spec §6.2): household products + global catalogue
        router.get('products', [controllers.Products, 'index'])
        router.get('products/:productId', [controllers.Products, 'show'])
        router
          .group(() => {
            router.post('products', [controllers.Products, 'store'])
            router.patch('products/:productId', [controllers.Products, 'update'])
            router.post('product-references', [controllers.ProductReferences, 'store'])
            router.get('barcode/:barcode', [controllers.ProductReferences, 'lookupBarcode'])
          })
          .use(middleware.household({ role: 'member' }))
      })
      .prefix('households/:householdId')
      .as('household')
      .use([middleware.auth(), middleware.household()])
  })
  .prefix('/api/v1')
