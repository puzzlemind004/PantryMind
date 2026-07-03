import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'households.households.index': { paramsTuple?: []; params?: {} }
    'households.households.store': { paramsTuple?: []; params?: {} }
    'households.household_invitations.join': { paramsTuple?: []; params?: {} }
    'household.households.show': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.households.update': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.household_invitations.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.household_invitations.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.household_invitations.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'invitationId': ParamValue} }
    'household.household_members.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'memberId': ParamValue} }
    'household.household_members.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'memberId': ParamValue} }
    'household.storage_locations.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.storage_locations.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.storage_locations.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'locationId': ParamValue} }
    'household.storage_locations.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'locationId': ParamValue} }
    'household.meal_types.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.meal_types.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.meal_types.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'mealTypeId': ParamValue} }
    'household.meal_types.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'mealTypeId': ParamValue} }
    'household.products.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.show': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'productId': ParamValue} }
    'household.products.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'productId': ParamValue} }
    'household.product_references.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.product_references.lookup_barcode': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'barcode': ParamValue} }
    'household.stock_items.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.stock_items.movements': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
    'household.stock_items.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.stock_items.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
    'household.stock_items.consume': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
    'household.stock_items.discard': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'households.households.index': { paramsTuple?: []; params?: {} }
    'household.households.show': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.household_invitations.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.storage_locations.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.meal_types.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.show': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'productId': ParamValue} }
    'household.product_references.lookup_barcode': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'barcode': ParamValue} }
    'household.stock_items.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.stock_items.movements': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'households.households.index': { paramsTuple?: []; params?: {} }
    'household.households.show': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.household_invitations.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.storage_locations.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.meal_types.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.show': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'productId': ParamValue} }
    'household.product_references.lookup_barcode': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'barcode': ParamValue} }
    'household.stock_items.index': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.stock_items.movements': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'households.households.store': { paramsTuple?: []; params?: {} }
    'households.household_invitations.join': { paramsTuple?: []; params?: {} }
    'household.household_invitations.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.storage_locations.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.meal_types.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.products.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.product_references.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.stock_items.store': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.stock_items.consume': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
    'household.stock_items.discard': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
  }
  PATCH: {
    'household.households.update': { paramsTuple: [ParamValue]; params: {'householdId': ParamValue} }
    'household.household_members.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'memberId': ParamValue} }
    'household.storage_locations.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'locationId': ParamValue} }
    'household.meal_types.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'mealTypeId': ParamValue} }
    'household.products.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'productId': ParamValue} }
    'household.stock_items.update': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'itemId': ParamValue} }
  }
  DELETE: {
    'household.household_invitations.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'invitationId': ParamValue} }
    'household.household_members.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'memberId': ParamValue} }
    'household.storage_locations.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'locationId': ParamValue} }
    'household.meal_types.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'householdId': ParamValue,'mealTypeId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}