/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'households.households.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/households_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/households_controller').default['index']>>>
    }
  }
  'households.households.store': {
    methods: ["POST"]
    pattern: '/api/v1/households'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').createHouseholdValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/household').createHouseholdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/households_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/households_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'households.household_invitations.join': {
    methods: ["POST"]
    pattern: '/api/v1/invitations/join'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').joinHouseholdValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/household').joinHouseholdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['join']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['join']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.households.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/households_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/households_controller').default['show']>>>
    }
  }
  'household.households.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').updateHouseholdValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').updateHouseholdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/households_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/households_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.household_invitations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/invitations'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['index']>>>
    }
  }
  'household.household_invitations.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/invitations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').createInvitationValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').createInvitationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.household_invitations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/invitations/:invitationId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; invitationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/household_invitations_controller').default['destroy']>>>
    }
  }
  'household.household_members.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/members/:memberId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').updateMemberValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; memberId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').updateMemberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/household_members_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/household_members_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.household_members.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/members/:memberId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; memberId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/household_members_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/household_members_controller').default['destroy']>>>
    }
  }
  'household.storage_locations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/storage-locations'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['index']>>>
    }
  }
  'household.storage_locations.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/storage-locations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').storageLocationValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').storageLocationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.storage_locations.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/storage-locations/:locationId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').updateStorageLocationValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; locationId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').updateStorageLocationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.storage_locations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/storage-locations/:locationId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; locationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/storage_locations_controller').default['destroy']>>>
    }
  }
  'household.meal_types.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/meal-types'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['index']>>>
    }
  }
  'household.meal_types.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/meal-types'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').mealTypeValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').mealTypeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.meal_types.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/meal-types/:mealTypeId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/household').updateMealTypeValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealTypeId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/household').updateMealTypeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.meal_types.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/meal-types/:mealTypeId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealTypeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meal_types_controller').default['destroy']>>>
    }
  }
  'household.products.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/products'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/catalog').searchProductsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.products.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/products/:productId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; productId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['show']>>>
    }
  }
  'household.products.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/products'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').createProductValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').createProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.products.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/products/:productId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').updateProductValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; productId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').updateProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.product_references.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/product-references'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/catalog').createReferenceValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/catalog').createReferenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_references_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_references_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.product_references.lookup_barcode': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/barcode/:barcode'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; barcode: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_references_controller').default['lookupBarcode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_references_controller').default['lookupBarcode']>>>
    }
  }
  'household.stock_items.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/stock-items'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/stock').listStockValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.stock_items.movements': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/movements'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['movements']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['movements']>>>
    }
  }
  'household.stock_items.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/stock-items'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock').addStockItemValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stock').addStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.stock_items.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/stock-items/:itemId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock').correctStockItemValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stock').correctStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.stock_items.consume': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/consume'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock').consumeStockItemValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stock').consumeStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['consume']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['consume']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.stock_items.discard': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/discard'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock').discardStockItemValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stock').discardStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['discard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['discard']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
