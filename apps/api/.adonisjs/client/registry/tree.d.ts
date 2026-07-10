/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  households: {
    households: {
      index: typeof routes['households.households.index']
      store: typeof routes['households.households.store']
    }
    householdInvitations: {
      join: typeof routes['households.household_invitations.join']
    }
  }
  household: {
    households: {
      show: typeof routes['household.households.show']
      update: typeof routes['household.households.update']
    }
    householdInvitations: {
      index: typeof routes['household.household_invitations.index']
      store: typeof routes['household.household_invitations.store']
      destroy: typeof routes['household.household_invitations.destroy']
    }
    householdMembers: {
      update: typeof routes['household.household_members.update']
      destroy: typeof routes['household.household_members.destroy']
    }
    storageLocations: {
      index: typeof routes['household.storage_locations.index']
      store: typeof routes['household.storage_locations.store']
      update: typeof routes['household.storage_locations.update']
      destroy: typeof routes['household.storage_locations.destroy']
    }
    mealTypes: {
      index: typeof routes['household.meal_types.index']
      store: typeof routes['household.meal_types.store']
      update: typeof routes['household.meal_types.update']
      destroy: typeof routes['household.meal_types.destroy']
    }
    products: {
      index: typeof routes['household.products.index']
      show: typeof routes['household.products.show']
      store: typeof routes['household.products.store']
      update: typeof routes['household.products.update']
    }
    productReferences: {
      store: typeof routes['household.product_references.store']
      lookupBarcode: typeof routes['household.product_references.lookup_barcode']
    }
    recipes: {
      index: typeof routes['household.recipes.index']
      show: typeof routes['household.recipes.show']
      feasibility: typeof routes['household.recipes.feasibility']
      store: typeof routes['household.recipes.store']
      update: typeof routes['household.recipes.update']
      destroy: typeof routes['household.recipes.destroy']
      duplicate: typeof routes['household.recipes.duplicate']
    }
    plannedMeals: {
      index: typeof routes['household.planned_meals.index']
      show: typeof routes['household.planned_meals.show']
      store: typeof routes['household.planned_meals.store']
      update: typeof routes['household.planned_meals.update']
      destroy: typeof routes['household.planned_meals.destroy']
      cancel: typeof routes['household.planned_meals.cancel']
      duplicate: typeof routes['household.planned_meals.duplicate']
      addRecipe: typeof routes['household.planned_meals.add_recipe']
      updateRecipe: typeof routes['household.planned_meals.update_recipe']
      removeRecipe: typeof routes['household.planned_meals.remove_recipe']
    }
    mealValidations: {
      preview: typeof routes['household.meal_validations.preview']
      complete: typeof routes['household.meal_validations.complete']
    }
    recommendations: {
      index: typeof routes['household.recommendations.index']
    }
    pushSubscriptions: {
      publicKey: typeof routes['household.push_subscriptions.public_key']
      subscribe: typeof routes['household.push_subscriptions.subscribe']
      unsubscribe: typeof routes['household.push_subscriptions.unsubscribe']
    }
    ciqual: {
      search: typeof routes['household.ciqual.search']
      link: typeof routes['household.ciqual.link']
    }
    nutrition: {
      recipe: typeof routes['household.nutrition.recipe']
      meal: typeof routes['household.nutrition.meal']
      daily: typeof routes['household.nutrition.daily']
    }
    shoppingLists: {
      show: typeof routes['household.shopping_lists.show']
      generate: typeof routes['household.shopping_lists.generate']
      addItem: typeof routes['household.shopping_lists.add_item']
      updateItem: typeof routes['household.shopping_lists.update_item']
      destroyItem: typeof routes['household.shopping_lists.destroy_item']
      checkItem: typeof routes['household.shopping_lists.check_item']
      uncheckItem: typeof routes['household.shopping_lists.uncheck_item']
    }
    productThresholds: {
      index: typeof routes['household.product_thresholds.index']
      upsert: typeof routes['household.product_thresholds.upsert']
      destroy: typeof routes['household.product_thresholds.destroy']
    }
    stockItems: {
      index: typeof routes['household.stock_items.index']
      movements: typeof routes['household.stock_items.movements']
      store: typeof routes['household.stock_items.store']
      update: typeof routes['household.stock_items.update']
      consume: typeof routes['household.stock_items.consume']
      discard: typeof routes['household.stock_items.discard']
    }
  }
}
