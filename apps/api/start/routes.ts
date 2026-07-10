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

        // Recipes: templates, never impact the stock (spec §4.7, 5.7)
        router.get('recipes', [controllers.Recipes, 'index'])
        router.get('recipes/:recipeId', [controllers.Recipes, 'show'])
        router.get('recipes/:recipeId/feasibility', [controllers.Recipes, 'feasibility'])
        router
          .group(() => {
            router.post('recipes', [controllers.Recipes, 'store'])
            router.patch('recipes/:recipeId', [controllers.Recipes, 'update'])
            router.delete('recipes/:recipeId', [controllers.Recipes, 'destroy'])
            router.post('recipes/:recipeId/duplicate', [controllers.Recipes, 'duplicate'])
          })
          .use(middleware.household({ role: 'member' }))

        // Meal planning: never touches the stock while "planned" (spec 5.1, §6.4)
        router.get('planned-meals', [controllers.PlannedMeals, 'index'])
        router.get('planned-meals/:mealId', [controllers.PlannedMeals, 'show'])
        router.get('planned-meals/:mealId/preview', [controllers.MealValidations, 'preview'])
        router
          .post('planned-meals/:mealId/complete', [controllers.MealValidations, 'complete'])
          .use(middleware.household({ role: 'member' }))
        router
          .group(() => {
            router.post('planned-meals', [controllers.PlannedMeals, 'store'])
            router.patch('planned-meals/:mealId', [controllers.PlannedMeals, 'update'])
            router.delete('planned-meals/:mealId', [controllers.PlannedMeals, 'destroy'])
            router.post('planned-meals/:mealId/cancel', [controllers.PlannedMeals, 'cancel'])
            router.post('planned-meals/:mealId/duplicate', [controllers.PlannedMeals, 'duplicate'])
            router.post('planned-meals/:mealId/recipes', [controllers.PlannedMeals, 'addRecipe'])
            router.patch('planned-meals/:mealId/recipes/:mealRecipeId', [
              controllers.PlannedMeals,
              'updateRecipe',
            ])
            router.delete('planned-meals/:mealId/recipes/:mealRecipeId', [
              controllers.PlannedMeals,
              'removeRecipe',
            ])
          })
          .use(middleware.household({ role: 'member' }))

        // Recommendations: transparent suggestions (spec §6.7, 9.5)
        router.get('recommendations', [controllers.Recommendations, 'index'])

        // Push notifications (spec §6.6)
        router.get('push/public-key', [controllers.PushSubscriptions, 'publicKey'])
        router
          .group(() => {
            router.post('push/subscriptions', [controllers.PushSubscriptions, 'subscribe'])
            router.post('push/unsubscribe', [controllers.PushSubscriptions, 'unsubscribe'])
          })
          .use(middleware.household({ role: 'member' }))

        // Nutrition: recipe, meal and daily summaries (spec §2)
        router.get('recipes/:recipeId/nutrition', [controllers.Nutrition, 'recipe'])
        router.get('planned-meals/:mealId/nutrition', [controllers.Nutrition, 'meal'])
        router.get('nutrition/daily', [controllers.Nutrition, 'daily'])

        // Shopping list: planning + stock + thresholds (spec 5.13-5.16, §6.5)
        router.get('shopping-list', [controllers.ShoppingLists, 'show'])
        router.get('product-thresholds', [controllers.ProductThresholds, 'index'])
        router
          .group(() => {
            router.post('shopping-list/generate', [controllers.ShoppingLists, 'generate'])
            router.post('shopping-list/items', [controllers.ShoppingLists, 'addItem'])
            router.patch('shopping-list/items/:itemId', [controllers.ShoppingLists, 'updateItem'])
            router.delete('shopping-list/items/:itemId', [controllers.ShoppingLists, 'destroyItem'])
            router.post('shopping-list/items/:itemId/check', [
              controllers.ShoppingLists,
              'checkItem',
            ])
            router.post('shopping-list/items/:itemId/uncheck', [
              controllers.ShoppingLists,
              'uncheckItem',
            ])
            router.put('product-thresholds', [controllers.ProductThresholds, 'upsert'])
            router.delete('product-thresholds/:thresholdId', [
              controllers.ProductThresholds,
              'destroy',
            ])
          })
          .use(middleware.household({ role: 'member' }))

        // Stock: physical lots, FIFO, full traceability (spec §4.5, §6.1)
        router.get('stock-items', [controllers.StockItems, 'index'])
        router.get('stock-items/:itemId/movements', [controllers.StockItems, 'movements'])
        router
          .group(() => {
            router.post('stock-items', [controllers.StockItems, 'store'])
            router.patch('stock-items/:itemId', [controllers.StockItems, 'update'])
            router.post('stock-items/:itemId/consume', [controllers.StockItems, 'consume'])
            router.post('stock-items/:itemId/discard', [controllers.StockItems, 'discard'])
          })
          .use(middleware.household({ role: 'member' }))
      })
      .prefix('households/:householdId')
      .as('household')
      .use([middleware.auth(), middleware.household()])
  })
  .prefix('/api/v1')
