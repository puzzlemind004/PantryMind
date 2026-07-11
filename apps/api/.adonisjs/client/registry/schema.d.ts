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
  'household.recipes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/recipes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recipe').listRecipesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.recipes.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/recipes/:recipeId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; recipeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['show']>>>
    }
  }
  'household.recipes.feasibility': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/recipes/:recipeId/feasibility'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; recipeId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recipe').feasibilityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['feasibility']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['feasibility']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.recipes.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/recipes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recipe').createRecipeValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/recipe').createRecipeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.recipes.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/recipes/:recipeId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recipe').updateRecipeValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; recipeId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/recipe').updateRecipeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.recipes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/recipes/:recipeId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; recipeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['destroy']>>>
    }
  }
  'household.recipes.duplicate': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/recipes/:recipeId/duplicate'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; recipeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['duplicate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recipes_controller').default['duplicate']>>>
    }
  }
  'household.planned_meals.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/planned-meals'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/planning').listPlannedMealsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['show']>>>
    }
  }
  'household.meal_validations.preview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/preview'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meal_validations_controller').default['preview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meal_validations_controller').default['preview']>>>
    }
  }
  'household.meal_validations.complete': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/meal_validations_controller').default['complete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/meal_validations_controller').default['complete']>>>
    }
  }
  'household.planned_meals.store': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/planned-meals'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/planning').createPlannedMealValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/planning').createPlannedMealValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/planning').updatePlannedMealValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/planning').updatePlannedMealValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['destroy']>>>
    }
  }
  'household.planned_meals.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/cancel'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/planning').cancelPlannedMealValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/planning').cancelPlannedMealValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['cancel']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.duplicate': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/duplicate'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/planning').duplicatePlannedMealValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/planning').duplicatePlannedMealValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['duplicate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['duplicate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.add_recipe': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/recipes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/planning').addMealRecipeValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/planning').addMealRecipeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['addRecipe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['addRecipe']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.update_recipe': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/planning').updateMealRecipeValidator)>>
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue; mealRecipeId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/planning').updateMealRecipeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['updateRecipe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['updateRecipe']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.planned_meals.remove_recipe': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue; mealRecipeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['removeRecipe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/planned_meals_controller').default['removeRecipe']>>>
    }
  }
  'household.recommendations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/recommendations'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recommendations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recommendations_controller').default['index']>>>
    }
  }
  'household.push_subscriptions.public_key': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/push/public-key'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/push_subscriptions_controller').default['publicKey']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/push_subscriptions_controller').default['publicKey']>>>
    }
  }
  'household.push_subscriptions.subscribe': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/push/subscriptions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/push_subscriptions_controller').default['subscribe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/push_subscriptions_controller').default['subscribe']>>>
    }
  }
  'household.push_subscriptions.unsubscribe': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/push/unsubscribe'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/push_subscriptions_controller').default['unsubscribe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/push_subscriptions_controller').default['unsubscribe']>>>
    }
  }
  'household.ciqual.search': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/ciqual'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ciqual_controller').default['search']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ciqual_controller').default['search']>>>
    }
  }
  'household.ciqual.link': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/products/:productId/ciqual'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; productId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ciqual_controller').default['link']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ciqual_controller').default['link']>>>
    }
  }
  'household.nutrition.recipe': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/recipes/:recipeId/nutrition'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; recipeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/nutrition_controller').default['recipe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/nutrition_controller').default['recipe']>>>
    }
  }
  'household.nutrition.meal': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/nutrition'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; mealId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/nutrition_controller').default['meal']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/nutrition_controller').default['meal']>>>
    }
  }
  'household.nutrition.daily': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/nutrition/daily'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/nutrition_controller').default['daily']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/nutrition_controller').default['daily']>>>
    }
  }
  'household.shopping_lists.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/shopping-list'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['show']>>>
    }
  }
  'household.product_thresholds.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/households/:householdId/product-thresholds'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_thresholds_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_thresholds_controller').default['index']>>>
    }
  }
  'household.shopping_lists.generate': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/shopping-list/generate'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shopping').generateShoppingListValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/shopping').generateShoppingListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['generate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['generate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.shopping_lists.add_item': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/shopping-list/items'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shopping').addShoppingItemValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/shopping').addShoppingItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['addItem']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['addItem']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.shopping_lists.update_item': {
    methods: ["PATCH"]
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shopping').updateShoppingItemValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/shopping').updateShoppingItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['updateItem']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['updateItem']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.shopping_lists.destroy_item': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['destroyItem']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['destroyItem']>>>
    }
  }
  'household.shopping_lists.check_item': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId/check'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shopping').checkShoppingItemValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/shopping').checkShoppingItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['checkItem']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['checkItem']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.shopping_lists.uncheck_item': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['uncheckItem']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopping_lists_controller').default['uncheckItem']>>>
    }
  }
  'household.product_thresholds.upsert': {
    methods: ["PUT"]
    pattern: '/api/v1/households/:householdId/product-thresholds'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shopping').upsertThresholdValidator)>>
      paramsTuple: [ParamValue]
      params: { householdId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/shopping').upsertThresholdValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_thresholds_controller').default['upsert']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_thresholds_controller').default['upsert']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'household.product_thresholds.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/households/:householdId/product-thresholds/:thresholdId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; thresholdId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/product_thresholds_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/product_thresholds_controller').default['destroy']>>>
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
  'household.stock_items.freeze': {
    methods: ["POST"]
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/freeze'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock').freezeStockItemValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { householdId: ParamValue; itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stock').freezeStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['freeze']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['freeze']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
