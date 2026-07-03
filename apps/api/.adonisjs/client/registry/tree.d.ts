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
