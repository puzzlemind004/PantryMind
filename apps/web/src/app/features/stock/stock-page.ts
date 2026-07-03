import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe, TranslateService } from '../../shared/i18n/translate';
import { StockApi } from './stock-api';
import type { StockItem } from '../../core/api/types';

type Filter = 'all' | 'expiringSoon';

/**
 * Vue principale du stock (spec §8.3) : liste temps réel triée par
 * urgence de péremption, recherche, alertes, consommation en 1 action.
 */
@Component({
  selector: 'app-stock-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-3 p-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'stock.title' | t }}</h1>
        <a routerLink="/stock/add" class="btn-primary !w-auto px-4 py-2 text-sm">
          + {{ 'stock.add' | t }}
        </a>
      </header>

      <input
        class="input"
        type="search"
        name="search"
        [placeholder]="'stock.searchPlaceholder' | t"
        [ngModel]="search()"
        (ngModelChange)="onSearch($event)"
      />

      <div class="flex gap-2">
        <button
          type="button"
          class="btn-secondary text-sm"
          [class.!border-primary]="filter() === 'all'"
          [class.text-primary]="filter() === 'all'"
          (click)="setFilter('all')"
        >
          {{ 'stock.filters.all' | t }}
        </button>
        <button
          type="button"
          class="btn-secondary text-sm"
          [class.!border-primary]="filter() === 'expiringSoon'"
          [class.text-primary]="filter() === 'expiringSoon'"
          (click)="setFilter('expiringSoon')"
        >
          {{ 'stock.filters.expiringSoon' | t }}
        </button>
      </div>

      @if (items(); as list) {
        @if (list.length === 0) {
          <p class="py-12 text-center text-muted">{{ 'stock.empty' | t }}</p>
        } @else {
          <ul class="flex flex-col gap-2">
            @for (item of list; track item.id) {
              <li class="card flex items-center gap-3 !p-3">
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">
                    {{ item.product?.name }}
                    @if (item.productReference?.brand) {
                      <span class="text-xs text-muted">· {{ item.productReference?.brand }}</span>
                    }
                  </p>
                  <p class="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span>{{ item.quantity }} {{ 'units.' + item.unit | t }}</span>
                    @if (item.storageLocation) {
                      <span class="rounded-full bg-surface px-2 py-0.5 text-xs">
                        {{ item.storageLocation.name }}
                      </span>
                    }
                    @if (expiryLabel(item); as label) {
                      <span
                        class="rounded-full px-2 py-0.5 text-xs font-medium"
                        [class.bg-danger]="item.isExpired"
                        [class.text-white]="item.isExpired"
                        [class.bg-primary-soft]="!item.isExpired"
                        [class.text-primary]="!item.isExpired"
                      >
                        {{ label }}
                      </span>
                    }
                  </p>
                </div>

                @if (householdStore.canEdit()) {
                  <div class="flex shrink-0 gap-1">
                    <button
                      type="button"
                      class="rounded-full p-2 text-primary transition-colors hover:bg-primary-soft"
                      [attr.aria-label]="'stock.consumeAll' | t"
                      [title]="'stock.consumeAll' | t"
                      (click)="consume(item)"
                    >
                      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M4 12l5 5L20 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="rounded-full p-2 text-danger transition-colors hover:bg-surface"
                      [attr.aria-label]="'stock.discard' | t"
                      [title]="'stock.discard' | t"
                      (click)="discard(item)"
                    >
                      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5 M14 11v5" />
                      </svg>
                    </button>
                  </div>
                }
              </li>
            }
          </ul>
        }
      } @else {
        <p class="py-12 text-center text-muted">{{ 'app.loading' | t }}</p>
      }
    </div>
  `,
})
export class StockPage implements OnInit {
  protected readonly householdStore = inject(HouseholdStore);
  private readonly stockApi = inject(StockApi);
  private readonly translateService = inject(TranslateService);

  protected readonly items = signal<StockItem[] | null>(null);
  protected readonly search = signal('');
  protected readonly filter = signal<Filter>('all');

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  protected readonly householdId = computed(() => this.householdStore.currentHousehold()?.id);

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => void this.refresh(), 250);
  }

  protected setFilter(filter: Filter): void {
    this.filter.set(filter);
    void this.refresh();
  }

  protected async consume(item: StockItem): Promise<void> {
    const householdId = this.householdId();
    if (!householdId) {
      return;
    }
    await this.stockApi.consume(householdId, item.id);
    await this.refresh();
  }

  protected async discard(item: StockItem): Promise<void> {
    const householdId = this.householdId();
    if (!householdId) {
      return;
    }
    await this.stockApi.discard(householdId, item.id);
    await this.refresh();
  }

  /** Badge de péremption : périmé / aujourd'hui / dans N jours (≤ 7 j). */
  protected expiryLabel(item: StockItem): string | null {
    if (!item.expiresAt) {
      return null;
    }
    if (item.isExpired) {
      return this.translateKey('stock.expired');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(item.expiresAt);
    const days = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
    if (days === 0) {
      return this.translateKey('stock.expiresToday');
    }
    if (days <= 7) {
      return this.translateKey('stock.expiresInDays', { days });
    }
    return null;
  }

  private translateKey(key: string, params?: Record<string, string | number>): string {
    return this.translateService.translate(key, params);
  }

  private async refresh(): Promise<void> {
    const householdId = this.householdId();
    if (!householdId) {
      return;
    }
    this.items.set(
      await this.stockApi.listItems(householdId, {
        search: this.search() || undefined,
        expiringWithinDays: this.filter() === 'expiringSoon' ? 7 : undefined,
      }),
    );
  }
}
