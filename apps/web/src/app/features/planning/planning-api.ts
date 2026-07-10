import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../../core/api/api-client';
import type {
  DailyNutrition,
  MealCompletionResult,
  MealNeed,
  PlannedMeal,
  Unit,
} from '../../core/api/types';

@Injectable({ providedIn: 'root' })
export class PlanningApi {
  private readonly api = inject(ApiClient);

  list(householdId: string, from: string, to: string): Promise<PlannedMeal[]> {
    return firstValueFrom(
      this.api.get<PlannedMeal[]>(`/households/${householdId}/planned-meals`, { from, to }),
    );
  }

  get(householdId: string, mealId: string): Promise<PlannedMeal> {
    return firstValueFrom(
      this.api.get<PlannedMeal>(`/households/${householdId}/planned-meals/${mealId}`),
    );
  }

  create(
    householdId: string,
    payload: {
      date: string;
      mealTypeId: string;
      recipes?: { recipeId: string; servings?: number }[];
    },
  ): Promise<PlannedMeal> {
    return firstValueFrom(
      this.api.post<PlannedMeal>(`/households/${householdId}/planned-meals`, payload),
    );
  }

  delete(householdId: string, mealId: string): Promise<void> {
    return firstValueFrom(this.api.delete(`/households/${householdId}/planned-meals/${mealId}`));
  }

  cancel(householdId: string, mealId: string, version: number): Promise<PlannedMeal> {
    return firstValueFrom(
      this.api.post<PlannedMeal>(`/households/${householdId}/planned-meals/${mealId}/cancel`, {
        version,
      }),
    );
  }

  duplicate(householdId: string, mealId: string, date: string): Promise<PlannedMeal> {
    return firstValueFrom(
      this.api.post<PlannedMeal>(`/households/${householdId}/planned-meals/${mealId}/duplicate`, {
        date,
      }),
    );
  }

  addRecipe(
    householdId: string,
    mealId: string,
    payload: { recipeId: string; servings?: number },
  ): Promise<PlannedMeal> {
    return firstValueFrom(
      this.api.post<PlannedMeal>(
        `/households/${householdId}/planned-meals/${mealId}/recipes`,
        payload,
      ),
    );
  }

  removeRecipe(householdId: string, mealId: string, mealRecipeId: string): Promise<void> {
    return firstValueFrom(
      this.api.delete(`/households/${householdId}/planned-meals/${mealId}/recipes/${mealRecipeId}`),
    );
  }

  dailyNutrition(householdId: string, date: string): Promise<DailyNutrition> {
    return firstValueFrom(
      this.api.get<DailyNutrition>(`/households/${householdId}/nutrition/daily`, { date }),
    );
  }

  preview(householdId: string, mealId: string): Promise<{ needs: MealNeed[] }> {
    return firstValueFrom(
      this.api.get<{ needs: MealNeed[] }>(
        `/households/${householdId}/planned-meals/${mealId}/preview`,
      ),
    );
  }

  complete(
    householdId: string,
    mealId: string,
    payload: { version: number; items?: { productId: string; quantity: number; unit: Unit }[] },
  ): Promise<{ meal: PlannedMeal; results: MealCompletionResult[] }> {
    return firstValueFrom(
      this.api.post<{ meal: PlannedMeal; results: MealCompletionResult[] }>(
        `/households/${householdId}/planned-meals/${mealId}/complete`,
        payload,
      ),
    );
  }
}
