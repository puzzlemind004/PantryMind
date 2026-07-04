/** Types miroirs des réponses de l'API (apps/api). */

export interface User {
  id: string;
  fullName: string | null;
  email: string;
  initials: string;
  createdAt: string;
  updatedAt: string | null;
}

export type HouseholdRole = 'admin' | 'member' | 'viewer';

export interface Household {
  id: string;
  name: string;
  settings: { automaticMode?: boolean };
  createdAt: string;
  updatedAt: string | null;
  members?: HouseholdMember[];
  storageLocations?: StorageLocation[];
  mealTypes?: MealType[];
}

export interface HouseholdMembership {
  role: HouseholdRole;
  household: Household;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  role: HouseholdRole;
  createdAt: string;
  user?: User;
}

export interface HouseholdInvitation {
  id: string;
  householdId: string;
  code: string;
  role: HouseholdRole;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

export type StorageLocationType = 'fridge' | 'freezer' | 'pantry' | 'cellar' | 'other';

export interface StorageLocation {
  id: string;
  householdId: string;
  name: string;
  type: StorageLocationType;
  description: string | null;
  position: number;
}

export interface MealType {
  id: string;
  householdId: string;
  name: string;
  defaultTime: string;
  position: number;
}

export interface NutritionPer100 {
  kcal?: number;
  proteins?: number;
  carbohydrates?: number;
  sugars?: number;
  fat?: number;
  saturatedFat?: number;
  fiber?: number;
  salt?: number;
}

export type Unit = 'mg' | 'g' | 'kg' | 'ml' | 'cl' | 'l' | 'unit';

export interface Product {
  id: string;
  name: string;
  category: string | null;
  defaultUnit: Unit;
  unitWeightGrams: number | null;
  densityGPerMl: number | null;
  nutritionPer100: NutritionPer100 | null;
  allergens: string[];
  isGlobal: boolean;
  references?: ProductReference[];
}

export interface ProductReference {
  id: string;
  productId: string;
  barcode: string | null;
  brand: string | null;
  name: string;
  packageQuantity: number | null;
  packageUnit: Unit | null;
  nutritionPer100: NutritionPer100 | null;
  imageUrl: string | null;
  shelfLifeDays: number | null;
  source: 'off' | 'manual';
}

export interface ExternalProductData {
  barcode: string;
  name: string;
  brand: string | null;
  packageQuantity: number | null;
  packageUnit: string | null;
  imageUrl: string | null;
  nutritionPer100: NutritionPer100 | null;
  categories: string[];
  allergens: string[];
}

export type BarcodeLookup =
  | { status: 'local'; reference: ProductReference; product: Product }
  | { status: 'external'; external: ExternalProductData };

export type StockItemStatus = 'available' | 'consumed' | 'discarded';

export interface StockItem {
  id: string;
  householdId: string;
  productId: string;
  productReferenceId: string | null;
  quantity: number;
  unit: Unit;
  storageLocationId: string | null;
  status: StockItemStatus;
  addedAt: string;
  expiresAt: string | null;
  version: number;
  isExpired: boolean;
  product?: Product;
  productReference?: ProductReference;
  storageLocation?: StorageLocation;
}

export interface RecipeIngredient {
  id: string;
  productId: string;
  quantity: number;
  unit: Unit;
  optional: boolean;
  note: string | null;
  position: number;
  product?: {
    id: string;
    name: string;
    category: string | null;
    defaultUnit: Unit;
    unitWeightGrams: number | null;
    densityGPerMl: number | null;
  };
  substitutes?: { productId: string; product?: { id: string; name: string } }[];
}

export interface Recipe {
  id: string;
  householdId: string;
  name: string;
  description: string | null;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  steps: string[];
  tags: string[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  ingredients?: RecipeIngredient[];
}

export interface RecipeFeasibility {
  servings: number;
  feasible: boolean;
  ingredients: {
    recipeIngredientId: string;
    productId: string;
    productName: string;
    unit: Unit;
    optional: boolean;
    required: number;
    available: number;
    missing: number;
  }[];
}

export type PlannedMealStatus = 'planned' | 'done' | 'cancelled';

export interface MealRecipeSnapshot {
  name: string;
  baseServings: number;
  ingredients: {
    productId: string;
    productName: string;
    quantity: number;
    unit: Unit;
    optional: boolean;
    substitutes: { productId: string; productName: string }[];
  }[];
}

export interface PlannedMealRecipe {
  id: string;
  recipeId: string | null;
  servings: number;
  snapshot: MealRecipeSnapshot;
}

export interface PlannedMeal {
  id: string;
  householdId: string;
  mealTypeId: string | null;
  mealName: string;
  date: string;
  timeOverride: string | null;
  effectiveTime: string | null;
  status: PlannedMealStatus;
  notes: string | null;
  version: number;
  recipes?: PlannedMealRecipe[];
}

export interface MealNeed {
  productId: string;
  productName: string;
  quantity: number;
  unit: Unit;
  optional: boolean;
  available: number;
  missing: number;
  substitutes: { productId: string; productName: string; available: number }[];
}

export interface MealCompletionResult {
  productId: string;
  requested: number;
  unit: Unit;
  consumed: number;
  missing: number;
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  productName: string;
  neededQuantity: number;
  unit: Unit;
  source: 'planning' | 'min_stock' | 'manual';
  packageCount: number | null;
  packaging: {
    referenceId: string;
    name: string;
    brand: string | null;
    packageQuantity: number | null;
    packageUnit: Unit | null;
  } | null;
  checkedAt: string | null;
}

export interface ShoppingList {
  id: string;
  householdId: string;
  status: 'active' | 'completed';
  version: number;
  generatedAt: string | null;
  items?: ShoppingListItem[];
}

export interface ProductThreshold {
  id: string;
  productId: string;
  productName: string;
  minQuantity: number;
  unit: Unit;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  userId: string | null;
  type: 'added' | 'consumed' | 'discarded' | 'corrected' | 'moved' | 'purchased';
  quantityDelta: number;
  unit: Unit;
  context: Record<string, unknown>;
  createdAt: string;
}
