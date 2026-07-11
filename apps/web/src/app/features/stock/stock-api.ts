import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../../core/api/api-client';
import type {
  BarcodeLookup,
  Product,
  ProductReference,
  StockItem,
  StockMovement,
  Unit,
} from '../../core/api/types';

export interface StockFilters {
  search?: string;
  storageLocationId?: string;
  expiringWithinDays?: number;
  kind?: string;
}

@Injectable({ providedIn: 'root' })
export class StockApi {
  private readonly api = inject(ApiClient);

  listItems(householdId: string, filters: StockFilters = {}): Promise<StockItem[]> {
    return firstValueFrom(
      this.api.get<StockItem[]>(`/households/${householdId}/stock-items`, { ...filters }),
    );
  }

  addItem(
    householdId: string,
    payload: {
      productId: string;
      productReferenceId?: string | null;
      quantity: number;
      unit: Unit;
      storageLocationId?: string | null;
      expiresAt?: string | null;
    },
  ): Promise<StockItem> {
    return firstValueFrom(this.api.post<StockItem>(`/households/${householdId}/stock-items`, payload));
  }

  updateItem(
    householdId: string,
    itemId: string,
    payload: { quantity?: number; storageLocationId?: string | null; expiresAt?: string | null },
  ): Promise<StockItem> {
    return firstValueFrom(
      this.api.patch<StockItem>(`/households/${householdId}/stock-items/${itemId}`, payload),
    );
  }

  consume(householdId: string, itemId: string, quantity?: number): Promise<StockItem> {
    return firstValueFrom(
      this.api.post<StockItem>(
        `/households/${householdId}/stock-items/${itemId}/consume`,
        quantity === undefined ? {} : { quantity },
      ),
    );
  }

  discard(
    householdId: string,
    itemId: string,
    reason: 'trashed' | 'lost' | 'given' = 'trashed',
  ): Promise<StockItem> {
    return firstValueFrom(
      this.api.post<StockItem>(`/households/${householdId}/stock-items/${itemId}/discard`, {
        reason,
      }),
    );
  }

  movements(householdId: string, itemId: string): Promise<StockMovement[]> {
    return firstValueFrom(
      this.api.get<StockMovement[]>(`/households/${householdId}/stock-items/${itemId}/movements`),
    );
  }

  searchProducts(householdId: string, search: string, kind?: string): Promise<Product[]> {
    return firstValueFrom(
      this.api.get<Product[]>(`/households/${householdId}/products`, { search, kind }),
    );
  }

  createProduct(
    householdId: string,
    payload: { name: string; kind?: string; defaultUnit?: Unit },
  ): Promise<Product> {
    return firstValueFrom(this.api.post<Product>(`/households/${householdId}/products`, payload));
  }

  freeze(householdId: string, itemId: string, storageLocationId?: string): Promise<StockItem> {
    return firstValueFrom(
      this.api.post<StockItem>(
        `/households/${householdId}/stock-items/${itemId}/freeze`,
        storageLocationId ? { storageLocationId } : {},
      ),
    );
  }

  lookupBarcode(householdId: string, barcode: string): Promise<BarcodeLookup> {
    return firstValueFrom(
      this.api.get<BarcodeLookup>(`/households/${householdId}/barcode/${barcode}`),
    );
  }

  createReference(
    householdId: string,
    payload: {
      newProduct?: { name: string; kind?: string; defaultUnit?: Unit };
      productId?: string;
      barcode?: string | null;
      name: string;
      brand?: string | null;
      packageQuantity?: number | null;
      packageUnit?: Unit | null;
      nutritionPer100?: unknown;
      imageUrl?: string | null;
      source?: 'off' | 'manual';
    },
  ): Promise<{ reference: ProductReference; product: Product }> {
    return firstValueFrom(
      this.api.post<{ reference: ProductReference; product: Product }>(
        `/households/${householdId}/product-references`,
        payload,
      ),
    );
  }
}
