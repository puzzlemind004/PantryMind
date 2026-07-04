import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { StockApi } from '../stock/stock-api';
import { ShoppingApi } from './shopping-api';
import type {
  Product,
  ProductThreshold,
  ShoppingList,
  ShoppingListItem,
  Unit,
} from '../../core/api/types';

const UNITS: Unit[] = ['g', 'kg', 'ml', 'cl', 'l', 'unit'];

/**
 * Écran courses (spec §8.9) : liste générée + manuelle, cocher un
 * article l'ajoute au stock, section seuils de réapprovisionnement.
 */
@Component({
  selector: 'app-shopping-page',
  imports: [FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-3 p-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'shopping.title' | t }}</h1>
        <button
          type="button"
          class="btn-primary !w-auto px-4 py-2 text-sm"
          [disabled]="pending()"
          (click)="generate()"
        >
          ⟳ {{ 'shopping.generate' | t }}
        </button>
      </header>

      @if (list(); as shoppingList) {
        @if ((shoppingList.items ?? []).length === 0) {
          <p class="py-12 text-center text-muted">{{ 'shopping.empty' | t }}</p>
        } @else {
          <!-- À acheter -->
          @if (uncheckedItems().length > 0) {
            <h2 class="mt-1 text-sm font-semibold text-muted">{{ 'shopping.toBuy' | t }}</h2>
            <ul class="flex flex-col gap-2">
              @for (item of uncheckedItems(); track item.id) {
                <li class="card flex items-center gap-3 !p-3">
                  <input
                    type="checkbox"
                    class="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                    [checked]="false"
                    (change)="check(item)"
                    [attr.aria-label]="item.productName"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium">{{ item.productName }}</p>
                    <p class="flex flex-wrap items-center gap-2 text-sm text-muted">
                      <span>{{ item.neededQuantity }} {{ 'units.' + item.unit | t }}</span>
                      @if (item.packaging && item.packageCount) {
                        <span class="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
                          {{
                            'shopping.packages'
                              | t: { count: item.packageCount, name: item.packaging.name }
                          }}
                        </span>
                      }
                      <span class="rounded-full bg-surface px-2 py-0.5 text-xs">
                        {{ 'shopping.sources.' + item.source | t }}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 text-danger"
                    (click)="deleteItem(item)"
                    aria-label="✕"
                  >
                    ✕
                  </button>
                </li>
              }
            </ul>
          }

          <!-- Dans le panier -->
          @if (checkedItems().length > 0) {
            <h2 class="mt-2 text-sm font-semibold text-muted">{{ 'shopping.inCart' | t }}</h2>
            <ul class="flex flex-col gap-2">
              @for (item of checkedItems(); track item.id) {
                <li class="card flex items-center gap-3 !p-3 opacity-60">
                  <input
                    type="checkbox"
                    class="h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                    [checked]="true"
                    (change)="uncheck(item)"
                    [attr.aria-label]="item.productName"
                  />
                  <p class="min-w-0 flex-1 truncate font-medium line-through">
                    {{ item.productName }}
                  </p>
                </li>
              }
            </ul>
          }
        }
      } @else {
        <p class="py-12 text-center text-muted">{{ 'app.loading' | t }}</p>
      }

      <!-- Ajout manuel -->
      <section class="card flex flex-col gap-2">
        <h2 class="text-sm font-semibold">{{ 'shopping.addManual' | t }}</h2>
        <input
          class="input"
          type="search"
          name="manualSearch"
          [placeholder]="'stock.searchPlaceholder' | t"
          [ngModel]="productSearch()"
          (ngModelChange)="onProductSearch($event)"
        />
        @for (product of productResults(); track product.id) {
          <div class="flex items-center gap-2">
            <span class="min-w-0 flex-1 truncate text-sm">{{ product.name }}</span>
            <input
              class="input !w-20 !px-2 text-right"
              type="number"
              [name]="'mq-' + product.id"
              min="0.001"
              step="any"
              [(ngModel)]="manualQuantity"
            />
            <select class="input !w-24 !px-2" [name]="'mu-' + product.id" [(ngModel)]="manualUnit">
              @for (unit of units; track unit) {
                <option [value]="unit">{{ 'units.' + unit | t }}</option>
              }
            </select>
            <button type="button" class="btn-secondary !px-3 !py-1 text-sm" (click)="addManual(product)">
              +
            </button>
          </div>
        }
      </section>

      <!-- Seuils minimums (spec 5.16) -->
      <details class="card">
        <summary class="cursor-pointer text-sm font-semibold">
          {{ 'shopping.thresholds' | t }}
        </summary>
        <p class="mt-2 text-xs text-muted">{{ 'shopping.thresholdHint' | t }}</p>
        <ul class="mt-2 flex flex-col gap-2">
          @for (threshold of thresholds(); track threshold.id) {
            <li class="flex items-center justify-between gap-2 text-sm">
              <span class="min-w-0 flex-1 truncate">{{ threshold.productName }}</span>
              <span class="text-muted">
                ≥ {{ threshold.minQuantity }} {{ 'units.' + threshold.unit | t }}
              </span>
              <button type="button" class="text-danger" (click)="deleteThreshold(threshold)">✕</button>
            </li>
          }
        </ul>
        <div class="mt-3 flex flex-col gap-2">
          <input
            class="input"
            type="search"
            name="thresholdSearch"
            [placeholder]="'recipes.searchProduct' | t"
            [ngModel]="thresholdSearch()"
            (ngModelChange)="onThresholdSearch($event)"
          />
          @for (product of thresholdResults(); track product.id) {
            <div class="flex items-center gap-2">
              <span class="min-w-0 flex-1 truncate text-sm">{{ product.name }}</span>
              <input
                class="input !w-20 !px-2 text-right"
                type="number"
                [name]="'tq-' + product.id"
                min="0.001"
                step="any"
                [(ngModel)]="thresholdQuantity"
              />
              <select class="input !w-24 !px-2" [name]="'tu-' + product.id" [(ngModel)]="thresholdUnit">
                @for (unit of units; track unit) {
                  <option [value]="unit">{{ 'units.' + unit | t }}</option>
                }
              </select>
              <button
                type="button"
                class="btn-secondary !px-3 !py-1 text-sm"
                (click)="addThreshold(product)"
              >
                +
              </button>
            </div>
          }
        </div>
      </details>
    </div>
  `,
})
export class ShoppingPage implements OnInit {
  private readonly householdStore = inject(HouseholdStore);
  private readonly shoppingApi = inject(ShoppingApi);
  private readonly stockApi = inject(StockApi);

  protected readonly units = UNITS;
  protected readonly list = signal<ShoppingList | null>(null);
  protected readonly thresholds = signal<ProductThreshold[]>([]);
  protected readonly pending = signal(false);

  protected readonly productSearch = signal('');
  protected readonly productResults = signal<Product[]>([]);
  protected manualQuantity = 1;
  protected manualUnit: Unit = 'unit';

  protected readonly thresholdSearch = signal('');
  protected readonly thresholdResults = signal<Product[]>([]);
  protected thresholdQuantity = 1;
  protected thresholdUnit: Unit = 'unit';

  protected readonly uncheckedItems = computed<ShoppingListItem[]>(
    () => this.list()?.items?.filter((item) => !item.checkedAt) ?? [],
  );
  protected readonly checkedItems = computed<ShoppingListItem[]>(
    () => this.list()?.items?.filter((item) => item.checkedAt) ?? [],
  );

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;
  private thresholdDebounce: ReturnType<typeof setTimeout> | null = null;

  private get householdId(): string | undefined {
    return this.householdStore.currentHousehold()?.id;
  }

  async ngOnInit(): Promise<void> {
    if (!this.householdId) {
      return;
    }
    const [list, thresholds] = await Promise.all([
      this.shoppingApi.getList(this.householdId),
      this.shoppingApi.listThresholds(this.householdId),
    ]);
    this.list.set(list);
    this.thresholds.set(thresholds.thresholds);
  }

  protected async generate(): Promise<void> {
    if (!this.householdId) {
      return;
    }
    this.pending.set(true);
    try {
      this.list.set(await this.shoppingApi.generate(this.householdId));
    } finally {
      this.pending.set(false);
    }
  }

  protected async check(item: ShoppingListItem): Promise<void> {
    if (!this.householdId) {
      return;
    }
    this.list.set(await this.shoppingApi.checkItem(this.householdId, item.id));
  }

  protected async uncheck(item: ShoppingListItem): Promise<void> {
    if (!this.householdId) {
      return;
    }
    this.list.set(await this.shoppingApi.uncheckItem(this.householdId, item.id));
  }

  protected async deleteItem(item: ShoppingListItem): Promise<void> {
    if (!this.householdId) {
      return;
    }
    await this.shoppingApi.deleteItem(this.householdId, item.id);
    this.list.set(await this.shoppingApi.getList(this.householdId));
  }

  protected onProductSearch(value: string): void {
    this.productSearch.set(value);
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(
      () => void this.runSearch(this.productSearch(), this.productResults),
      250,
    );
  }

  protected onThresholdSearch(value: string): void {
    this.thresholdSearch.set(value);
    if (this.thresholdDebounce) {
      clearTimeout(this.thresholdDebounce);
    }
    this.thresholdDebounce = setTimeout(
      () => void this.runSearch(this.thresholdSearch(), this.thresholdResults),
      250,
    );
  }

  protected async addManual(product: Product): Promise<void> {
    if (!this.householdId || this.manualQuantity <= 0) {
      return;
    }
    this.list.set(
      await this.shoppingApi.addItem(this.householdId, {
        productId: product.id,
        quantity: this.manualQuantity,
        unit: this.manualUnit,
      }),
    );
    this.productSearch.set('');
    this.productResults.set([]);
  }

  protected async addThreshold(product: Product): Promise<void> {
    if (!this.householdId || this.thresholdQuantity <= 0) {
      return;
    }
    await this.shoppingApi.upsertThreshold(this.householdId, {
      productId: product.id,
      minQuantity: this.thresholdQuantity,
      unit: this.thresholdUnit,
    });
    this.thresholds.set((await this.shoppingApi.listThresholds(this.householdId)).thresholds);
    this.thresholdSearch.set('');
    this.thresholdResults.set([]);
  }

  protected async deleteThreshold(threshold: ProductThreshold): Promise<void> {
    if (!this.householdId) {
      return;
    }
    await this.shoppingApi.deleteThreshold(this.householdId, threshold.id);
    this.thresholds.update((list) => list.filter((item) => item.id !== threshold.id));
  }

  private async runSearch(
    query: string,
    target: ReturnType<typeof signal<Product[]>>,
  ): Promise<void> {
    const search = query.trim();
    if (!this.householdId || search.length < 2) {
      target.set([]);
      return;
    }
    target.set(await this.stockApi.searchProducts(this.householdId, search));
  }
}
