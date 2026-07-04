import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../../core/api/api-client';
import type { Recipe, RecipeFeasibility, Unit } from '../../core/api/types';

export interface RecipeIngredientPayload {
  productId: string;
  quantity: number;
  unit: Unit;
  optional?: boolean;
  substituteProductIds?: string[];
}

export interface RecipePayload {
  name?: string;
  description?: string | null;
  servings?: number;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  steps?: string[];
  tags?: string[];
  ingredients?: RecipeIngredientPayload[];
}

@Injectable({ providedIn: 'root' })
export class RecipesApi {
  private readonly api = inject(ApiClient);

  list(householdId: string, filters: { search?: string; tag?: string } = {}): Promise<Recipe[]> {
    return firstValueFrom(this.api.get<Recipe[]>(`/households/${householdId}/recipes`, filters));
  }

  get(householdId: string, recipeId: string): Promise<Recipe> {
    return firstValueFrom(this.api.get<Recipe>(`/households/${householdId}/recipes/${recipeId}`));
  }

  create(householdId: string, payload: RecipePayload): Promise<Recipe> {
    return firstValueFrom(this.api.post<Recipe>(`/households/${householdId}/recipes`, payload));
  }

  update(householdId: string, recipeId: string, payload: RecipePayload): Promise<Recipe> {
    return firstValueFrom(
      this.api.patch<Recipe>(`/households/${householdId}/recipes/${recipeId}`, payload),
    );
  }

  delete(householdId: string, recipeId: string): Promise<void> {
    return firstValueFrom(this.api.delete(`/households/${householdId}/recipes/${recipeId}`));
  }

  duplicate(householdId: string, recipeId: string): Promise<Recipe> {
    return firstValueFrom(
      this.api.post<Recipe>(`/households/${householdId}/recipes/${recipeId}/duplicate`),
    );
  }

  feasibility(householdId: string, recipeId: string, servings?: number): Promise<RecipeFeasibility> {
    return firstValueFrom(
      this.api.get<RecipeFeasibility>(`/households/${householdId}/recipes/${recipeId}/feasibility`, {
        servings,
      }),
    );
  }
}
