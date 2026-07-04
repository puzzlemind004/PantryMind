/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'households.households.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households',
    tokens: [{"old":"/api/v1/households","type":0,"val":"api","end":""},{"old":"/api/v1/households","type":0,"val":"v1","end":""},{"old":"/api/v1/households","type":0,"val":"households","end":""}],
    types: placeholder as Registry['households.households.index']['types'],
  },
  'households.households.store': {
    methods: ["POST"],
    pattern: '/api/v1/households',
    tokens: [{"old":"/api/v1/households","type":0,"val":"api","end":""},{"old":"/api/v1/households","type":0,"val":"v1","end":""},{"old":"/api/v1/households","type":0,"val":"households","end":""}],
    types: placeholder as Registry['households.households.store']['types'],
  },
  'households.household_invitations.join': {
    methods: ["POST"],
    pattern: '/api/v1/invitations/join',
    tokens: [{"old":"/api/v1/invitations/join","type":0,"val":"api","end":""},{"old":"/api/v1/invitations/join","type":0,"val":"v1","end":""},{"old":"/api/v1/invitations/join","type":0,"val":"invitations","end":""},{"old":"/api/v1/invitations/join","type":0,"val":"join","end":""}],
    types: placeholder as Registry['households.household_invitations.join']['types'],
  },
  'household.households.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId',
    tokens: [{"old":"/api/v1/households/:householdId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId","type":1,"val":"householdId","end":""}],
    types: placeholder as Registry['household.households.show']['types'],
  },
  'household.households.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId',
    tokens: [{"old":"/api/v1/households/:householdId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId","type":1,"val":"householdId","end":""}],
    types: placeholder as Registry['household.households.update']['types'],
  },
  'household.household_invitations.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/invitations',
    tokens: [{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/invitations","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"invitations","end":""}],
    types: placeholder as Registry['household.household_invitations.index']['types'],
  },
  'household.household_invitations.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/invitations',
    tokens: [{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/invitations","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/invitations","type":0,"val":"invitations","end":""}],
    types: placeholder as Registry['household.household_invitations.store']['types'],
  },
  'household.household_invitations.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/invitations/:invitationId',
    tokens: [{"old":"/api/v1/households/:householdId/invitations/:invitationId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/invitations/:invitationId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/invitations/:invitationId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/invitations/:invitationId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/invitations/:invitationId","type":0,"val":"invitations","end":""},{"old":"/api/v1/households/:householdId/invitations/:invitationId","type":1,"val":"invitationId","end":""}],
    types: placeholder as Registry['household.household_invitations.destroy']['types'],
  },
  'household.household_members.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/members/:memberId',
    tokens: [{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"members","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":1,"val":"memberId","end":""}],
    types: placeholder as Registry['household.household_members.update']['types'],
  },
  'household.household_members.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/members/:memberId',
    tokens: [{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":0,"val":"members","end":""},{"old":"/api/v1/households/:householdId/members/:memberId","type":1,"val":"memberId","end":""}],
    types: placeholder as Registry['household.household_members.destroy']['types'],
  },
  'household.storage_locations.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/storage-locations',
    tokens: [{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"storage-locations","end":""}],
    types: placeholder as Registry['household.storage_locations.index']['types'],
  },
  'household.storage_locations.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/storage-locations',
    tokens: [{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/storage-locations","type":0,"val":"storage-locations","end":""}],
    types: placeholder as Registry['household.storage_locations.store']['types'],
  },
  'household.storage_locations.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/storage-locations/:locationId',
    tokens: [{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"storage-locations","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":1,"val":"locationId","end":""}],
    types: placeholder as Registry['household.storage_locations.update']['types'],
  },
  'household.storage_locations.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/storage-locations/:locationId',
    tokens: [{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":0,"val":"storage-locations","end":""},{"old":"/api/v1/households/:householdId/storage-locations/:locationId","type":1,"val":"locationId","end":""}],
    types: placeholder as Registry['household.storage_locations.destroy']['types'],
  },
  'household.meal_types.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/meal-types',
    tokens: [{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"meal-types","end":""}],
    types: placeholder as Registry['household.meal_types.index']['types'],
  },
  'household.meal_types.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/meal-types',
    tokens: [{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/meal-types","type":0,"val":"meal-types","end":""}],
    types: placeholder as Registry['household.meal_types.store']['types'],
  },
  'household.meal_types.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/meal-types/:mealTypeId',
    tokens: [{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"meal-types","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":1,"val":"mealTypeId","end":""}],
    types: placeholder as Registry['household.meal_types.update']['types'],
  },
  'household.meal_types.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/meal-types/:mealTypeId',
    tokens: [{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":0,"val":"meal-types","end":""},{"old":"/api/v1/households/:householdId/meal-types/:mealTypeId","type":1,"val":"mealTypeId","end":""}],
    types: placeholder as Registry['household.meal_types.destroy']['types'],
  },
  'household.products.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/products',
    tokens: [{"old":"/api/v1/households/:householdId/products","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/products","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/products","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/products","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['household.products.index']['types'],
  },
  'household.products.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/products/:productId',
    tokens: [{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"products","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":1,"val":"productId","end":""}],
    types: placeholder as Registry['household.products.show']['types'],
  },
  'household.products.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/products',
    tokens: [{"old":"/api/v1/households/:householdId/products","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/products","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/products","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/products","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['household.products.store']['types'],
  },
  'household.products.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/products/:productId',
    tokens: [{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":0,"val":"products","end":""},{"old":"/api/v1/households/:householdId/products/:productId","type":1,"val":"productId","end":""}],
    types: placeholder as Registry['household.products.update']['types'],
  },
  'household.product_references.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/product-references',
    tokens: [{"old":"/api/v1/households/:householdId/product-references","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/product-references","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/product-references","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/product-references","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/product-references","type":0,"val":"product-references","end":""}],
    types: placeholder as Registry['household.product_references.store']['types'],
  },
  'household.product_references.lookup_barcode': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/barcode/:barcode',
    tokens: [{"old":"/api/v1/households/:householdId/barcode/:barcode","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/barcode/:barcode","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/barcode/:barcode","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/barcode/:barcode","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/barcode/:barcode","type":0,"val":"barcode","end":""},{"old":"/api/v1/households/:householdId/barcode/:barcode","type":1,"val":"barcode","end":""}],
    types: placeholder as Registry['household.product_references.lookup_barcode']['types'],
  },
  'household.recipes.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/recipes',
    tokens: [{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"recipes","end":""}],
    types: placeholder as Registry['household.recipes.index']['types'],
  },
  'household.recipes.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/recipes/:recipeId',
    tokens: [{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":1,"val":"recipeId","end":""}],
    types: placeholder as Registry['household.recipes.show']['types'],
  },
  'household.recipes.feasibility': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/recipes/:recipeId/feasibility',
    tokens: [{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":1,"val":"recipeId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/feasibility","type":0,"val":"feasibility","end":""}],
    types: placeholder as Registry['household.recipes.feasibility']['types'],
  },
  'household.recipes.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/recipes',
    tokens: [{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes","type":0,"val":"recipes","end":""}],
    types: placeholder as Registry['household.recipes.store']['types'],
  },
  'household.recipes.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/recipes/:recipeId',
    tokens: [{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":1,"val":"recipeId","end":""}],
    types: placeholder as Registry['household.recipes.update']['types'],
  },
  'household.recipes.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/recipes/:recipeId',
    tokens: [{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId","type":1,"val":"recipeId","end":""}],
    types: placeholder as Registry['household.recipes.destroy']['types'],
  },
  'household.recipes.duplicate': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/recipes/:recipeId/duplicate',
    tokens: [{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":1,"val":"recipeId","end":""},{"old":"/api/v1/households/:householdId/recipes/:recipeId/duplicate","type":0,"val":"duplicate","end":""}],
    types: placeholder as Registry['household.recipes.duplicate']['types'],
  },
  'household.planned_meals.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/planned-meals',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"planned-meals","end":""}],
    types: placeholder as Registry['household.planned_meals.index']['types'],
  },
  'household.planned_meals.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":1,"val":"mealId","end":""}],
    types: placeholder as Registry['household.planned_meals.show']['types'],
  },
  'household.meal_validations.preview': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/preview',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/preview","type":0,"val":"preview","end":""}],
    types: placeholder as Registry['household.meal_validations.preview']['types'],
  },
  'household.meal_validations.complete': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/complete',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['household.meal_validations.complete']['types'],
  },
  'household.planned_meals.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/planned-meals',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals","type":0,"val":"planned-meals","end":""}],
    types: placeholder as Registry['household.planned_meals.store']['types'],
  },
  'household.planned_meals.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":1,"val":"mealId","end":""}],
    types: placeholder as Registry['household.planned_meals.update']['types'],
  },
  'household.planned_meals.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId","type":1,"val":"mealId","end":""}],
    types: placeholder as Registry['household.planned_meals.destroy']['types'],
  },
  'household.planned_meals.cancel': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/cancel',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/cancel","type":0,"val":"cancel","end":""}],
    types: placeholder as Registry['household.planned_meals.cancel']['types'],
  },
  'household.planned_meals.duplicate': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/duplicate',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/duplicate","type":0,"val":"duplicate","end":""}],
    types: placeholder as Registry['household.planned_meals.duplicate']['types'],
  },
  'household.planned_meals.add_recipe': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/recipes',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes","type":0,"val":"recipes","end":""}],
    types: placeholder as Registry['household.planned_meals.add_recipe']['types'],
  },
  'household.planned_meals.update_recipe': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":1,"val":"mealRecipeId","end":""}],
    types: placeholder as Registry['household.planned_meals.update_recipe']['types'],
  },
  'household.planned_meals.remove_recipe': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId',
    tokens: [{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"planned-meals","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":1,"val":"mealId","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":0,"val":"recipes","end":""},{"old":"/api/v1/households/:householdId/planned-meals/:mealId/recipes/:mealRecipeId","type":1,"val":"mealRecipeId","end":""}],
    types: placeholder as Registry['household.planned_meals.remove_recipe']['types'],
  },
  'household.shopping_lists.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/shopping-list',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list","type":0,"val":"shopping-list","end":""}],
    types: placeholder as Registry['household.shopping_lists.show']['types'],
  },
  'household.product_thresholds.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/product-thresholds',
    tokens: [{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"product-thresholds","end":""}],
    types: placeholder as Registry['household.product_thresholds.index']['types'],
  },
  'household.shopping_lists.generate': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/shopping-list/generate',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list/generate","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list/generate","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list/generate","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list/generate","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/generate","type":0,"val":"shopping-list","end":""},{"old":"/api/v1/households/:householdId/shopping-list/generate","type":0,"val":"generate","end":""}],
    types: placeholder as Registry['household.shopping_lists.generate']['types'],
  },
  'household.shopping_lists.add_item': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/shopping-list/items',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list/items","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items","type":0,"val":"shopping-list","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items","type":0,"val":"items","end":""}],
    types: placeholder as Registry['household.shopping_lists.add_item']['types'],
  },
  'household.shopping_lists.update_item': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"shopping-list","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"items","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":1,"val":"itemId","end":""}],
    types: placeholder as Registry['household.shopping_lists.update_item']['types'],
  },
  'household.shopping_lists.destroy_item': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"shopping-list","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":0,"val":"items","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId","type":1,"val":"itemId","end":""}],
    types: placeholder as Registry['household.shopping_lists.destroy_item']['types'],
  },
  'household.shopping_lists.check_item': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId/check',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":0,"val":"shopping-list","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":0,"val":"items","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":1,"val":"itemId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/check","type":0,"val":"check","end":""}],
    types: placeholder as Registry['household.shopping_lists.check_item']['types'],
  },
  'household.shopping_lists.uncheck_item': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck',
    tokens: [{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":0,"val":"shopping-list","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":0,"val":"items","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":1,"val":"itemId","end":""},{"old":"/api/v1/households/:householdId/shopping-list/items/:itemId/uncheck","type":0,"val":"uncheck","end":""}],
    types: placeholder as Registry['household.shopping_lists.uncheck_item']['types'],
  },
  'household.product_thresholds.upsert': {
    methods: ["PUT"],
    pattern: '/api/v1/households/:householdId/product-thresholds',
    tokens: [{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/product-thresholds","type":0,"val":"product-thresholds","end":""}],
    types: placeholder as Registry['household.product_thresholds.upsert']['types'],
  },
  'household.product_thresholds.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/households/:householdId/product-thresholds/:thresholdId',
    tokens: [{"old":"/api/v1/households/:householdId/product-thresholds/:thresholdId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/product-thresholds/:thresholdId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/product-thresholds/:thresholdId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/product-thresholds/:thresholdId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/product-thresholds/:thresholdId","type":0,"val":"product-thresholds","end":""},{"old":"/api/v1/households/:householdId/product-thresholds/:thresholdId","type":1,"val":"thresholdId","end":""}],
    types: placeholder as Registry['household.product_thresholds.destroy']['types'],
  },
  'household.stock_items.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/stock-items',
    tokens: [{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"stock-items","end":""}],
    types: placeholder as Registry['household.stock_items.index']['types'],
  },
  'household.stock_items.movements': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/movements',
    tokens: [{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":0,"val":"stock-items","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":1,"val":"itemId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/movements","type":0,"val":"movements","end":""}],
    types: placeholder as Registry['household.stock_items.movements']['types'],
  },
  'household.stock_items.store': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/stock-items',
    tokens: [{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/stock-items","type":0,"val":"stock-items","end":""}],
    types: placeholder as Registry['household.stock_items.store']['types'],
  },
  'household.stock_items.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/households/:householdId/stock-items/:itemId',
    tokens: [{"old":"/api/v1/households/:householdId/stock-items/:itemId","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId","type":0,"val":"stock-items","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId","type":1,"val":"itemId","end":""}],
    types: placeholder as Registry['household.stock_items.update']['types'],
  },
  'household.stock_items.consume': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/consume',
    tokens: [{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":0,"val":"stock-items","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":1,"val":"itemId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/consume","type":0,"val":"consume","end":""}],
    types: placeholder as Registry['household.stock_items.consume']['types'],
  },
  'household.stock_items.discard': {
    methods: ["POST"],
    pattern: '/api/v1/households/:householdId/stock-items/:itemId/discard',
    tokens: [{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":0,"val":"api","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":0,"val":"v1","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":0,"val":"households","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":1,"val":"householdId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":0,"val":"stock-items","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":1,"val":"itemId","end":""},{"old":"/api/v1/households/:householdId/stock-items/:itemId/discard","type":0,"val":"discard","end":""}],
    types: placeholder as Registry['household.stock_items.discard']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
