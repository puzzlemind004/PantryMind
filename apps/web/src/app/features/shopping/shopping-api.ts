import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../../core/api/api-client';
import type { ProductThreshold, ShoppingList, Unit } from '../../core/api/types';

@Injectable({ providedIn: 'root' })
export class ShoppingApi {
  private readonly api = inject(ApiClient);

  getList(householdId: string): Promise<ShoppingList> {
    return firstValueFrom(this.api.get<ShoppingList>(`/households/${householdId}/shopping-list`));
  }

  generate(
    householdId: string,
    window: { shoppingDate?: string; nextShoppingDate?: string } = {},
  ): Promise<ShoppingList> {
    return firstValueFrom(
      this.api.post<ShoppingList>(`/households/${householdId}/shopping-list/generate`, window),
    );
  }

  scan(
    householdId: string,
    barcode: string,
  ): Promise<{ status: 'checked' | 'added'; productName: string; list: ShoppingList }> {
    return firstValueFrom(
      this.api.post<{ status: 'checked' | 'added'; productName: string; list: ShoppingList }>(
        `/households/${householdId}/shopping-list/scan`,
        { barcode },
      ),
    );
  }

  addItem(
    householdId: string,
    payload: { productId: string; quantity: number; unit: Unit },
  ): Promise<ShoppingList> {
    return firstValueFrom(
      this.api.post<ShoppingList>(`/households/${householdId}/shopping-list/items`, payload),
    );
  }

  deleteItem(householdId: string, itemId: string): Promise<void> {
    return firstValueFrom(
      this.api.delete(`/households/${householdId}/shopping-list/items/${itemId}`),
    );
  }

  checkItem(householdId: string, itemId: string): Promise<ShoppingList> {
    return firstValueFrom(
      this.api.post<ShoppingList>(
        `/households/${householdId}/shopping-list/items/${itemId}/check`,
        {},
      ),
    );
  }

  uncheckItem(householdId: string, itemId: string): Promise<ShoppingList> {
    return firstValueFrom(
      this.api.post<ShoppingList>(
        `/households/${householdId}/shopping-list/items/${itemId}/uncheck`,
        {},
      ),
    );
  }

  listThresholds(householdId: string): Promise<{ thresholds: ProductThreshold[] }> {
    return firstValueFrom(
      this.api.get<{ thresholds: ProductThreshold[] }>(
        `/households/${householdId}/product-thresholds`,
      ),
    );
  }

  upsertThreshold(
    householdId: string,
    payload: { productId: string; minQuantity: number; unit: Unit },
  ): Promise<ProductThreshold> {
    return firstValueFrom(
      this.api.put<ProductThreshold>(`/households/${householdId}/product-thresholds`, payload),
    );
  }

  deleteThreshold(householdId: string, thresholdId: string): Promise<void> {
    return firstValueFrom(
      this.api.delete(`/households/${householdId}/product-thresholds/${thresholdId}`),
    );
  }
}
