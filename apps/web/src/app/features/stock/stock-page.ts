import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HouseholdApi } from '../../core/household/household-api';
import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe, TranslateService } from '../../shared/i18n/translate';
import { StockApi } from './stock-api';
import type { ProductKind, StockItem, StorageLocation } from '../../core/api/types';

type Filter = 'all' | 'expiringSoon';

/**
 * Vue principale du stock (spec §8.3) : liste temps réel triée par
 * urgence de péremption, recherche, alertes, consommation en 1 action.
 * Tap sur un lot → fiche d'édition (quantité, emplacement, DLC) et
 * actions libellées (retour utilisateur 2026-07-04 : icônes ambiguës,
 * pas d'édition possible).
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

      <!-- Filtres emplacement + type (idée boîte à idées, Lot 6) -->
      <div class="flex gap-2">
        <select
          class="input flex-1 !py-1.5 text-sm"
          name="locationFilter"
          [ngModel]="locationFilter()"
          (ngModelChange)="setLocationFilter($event)"
        >
          <option value="">{{ 'stock.filters.byLocation' | t }}</option>
          @for (location of locations(); track location.id) {
            <option [value]="location.id">{{ location.name }}</option>
          }
        </select>
        <select
          class="input flex-1 !py-1.5 text-sm"
          name="kindFilter"
          [ngModel]="kindFilter()"
          (ngModelChange)="setKindFilter($event)"
        >
          <option value="">{{ 'stock.filters.byKind' | t }}</option>
          @for (kind of kinds; track kind) {
            <option [value]="kind">{{ 'stock.kinds.' + kind | t }}</option>
          }
        </select>
      </div>

      @if (items(); as list) {
        @if (list.length === 0) {
          <p class="py-12 text-center text-muted">{{ 'stock.empty' | t }}</p>
        } @else {
          <ul class="flex flex-col gap-2">
            @for (item of list; track item.id) {
              <li class="card flex items-center gap-3 !p-3">
                @if (item.productReference?.imageUrl) {
                  <img
                    [src]="item.productReference!.imageUrl"
                    [alt]="item.product?.name ?? ''"
                    class="h-12 w-12 shrink-0 rounded-lg bg-surface object-contain"
                    loading="lazy"
                  />
                }
                <button
                  type="button"
                  class="min-w-0 flex-1 text-left"
                  (click)="openItem(item)"
                >
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
                    @if (item.frozenAt) {
                      <span class="rounded-full bg-surface px-2 py-0.5 text-xs">
                        ❄️ {{ 'stock.frozen' | t }}
                      </span>
                    }
                    @if (item.product && item.product.kind !== 'food') {
                      <span class="rounded-full bg-surface px-2 py-0.5 text-xs">
                        {{ 'stock.kinds.' + item.product.kind | t }}
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
                </button>

                @if (householdStore.canEdit()) {
                  <button
                    type="button"
                    class="shrink-0 rounded-full p-2 text-primary transition-colors hover:bg-primary-soft"
                    [attr.aria-label]="'stock.consumeAll' | t"
                    [title]="'stock.consumeAll' | t"
                    (click)="consumeAll(item)"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  </button>
                }
              </li>
            }
          </ul>
        }
      } @else {
        <p class="py-12 text-center text-muted">{{ 'app.loading' | t }}</p>
      }

      <!-- Fiche lot : édition + actions libellées -->
      @if (selected(); as item) {
        <div
          class="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          (click)="selected.set(null)"
        >
          <div
            class="card flex max-h-[90dvh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-b-none sm:rounded-b-[var(--radius-card)]"
            (click)="$event.stopPropagation()"
          >
            <header class="flex items-center gap-3">
              @if (item.productReference?.imageUrl) {
                <img
                  [src]="item.productReference!.imageUrl"
                  [alt]="item.product?.name ?? ''"
                  class="h-16 w-16 shrink-0 rounded-lg bg-surface object-contain"
                />
              }
              <div class="min-w-0">
                <h2 class="truncate text-lg font-semibold">{{ item.product?.name }}</h2>
                @if (item.productReference) {
                  <p class="truncate text-sm text-muted">
                    {{ item.productReference.brand }} {{ item.productReference.name }}
                  </p>
                }
              </div>
            </header>

            @if (householdStore.canEdit()) {
              <!-- Édition (spec 5.18 : correction manuelle à tout moment) -->
              <section class="flex flex-col gap-3">
                <h3 class="text-sm font-semibold text-muted">{{ 'stock.editTitle' | t }}</h3>
                <div class="flex gap-3">
                  <label class="flex flex-1 flex-col gap-1">
                    <span class="text-sm font-medium">{{ 'stock.quantity' | t }}</span>
                    <input
                      class="input"
                      type="number"
                      name="editQuantity"
                      min="0"
                      step="any"
                      [(ngModel)]="editQuantity"
                    />
                  </label>
                  <label class="flex flex-1 flex-col gap-1">
                    <span class="text-sm font-medium">{{ 'stock.expiryDate' | t }}</span>
                    <input class="input" type="date" name="editExpiresAt" [(ngModel)]="editExpiresAt" />
                  </label>
                </div>
                <label class="flex flex-col gap-1">
                  <span class="text-sm font-medium">{{ 'stock.location' | t }}</span>
                  <select class="input" name="editLocation" [(ngModel)]="editLocationId">
                    <option value="">—</option>
                    @for (location of locations(); track location.id) {
                      <option [value]="location.id">{{ location.name }}</option>
                    }
                  </select>
                </label>
                <button type="button" class="btn-primary" [disabled]="pending()" (click)="saveEdit(item)">
                  {{ 'app.save' | t }}
                </button>
              </section>

              <!-- Actions libellées (fini les icônes ambiguës) -->
              <section class="flex flex-col gap-2">
                <h3 class="text-sm font-semibold text-muted">{{ 'stock.actions' | t }}</h3>
                <div class="flex items-center gap-2">
                  <input
                    class="input !w-24 !px-2 text-right"
                    type="number"
                    name="consumeQuantity"
                    min="0.001"
                    step="any"
                    [(ngModel)]="consumeQuantity"
                  />
                  <span class="text-sm text-muted">{{ 'units.' + item.unit | t }}</span>
                  <button
                    type="button"
                    class="btn-secondary flex-1 text-primary"
                    [disabled]="pending()"
                    (click)="consumePartial(item)"
                  >
                    {{ 'stock.consume' | t }}
                  </button>
                </div>
                <button type="button" class="btn-secondary text-primary" [disabled]="pending()" (click)="consumeAll(item)">
                  ✓ {{ 'stock.consumeAll' | t }}
                </button>
                @if (!item.frozenAt && hasFreezer()) {
                  <button
                    type="button"
                    class="btn-secondary"
                    [disabled]="pending()"
                    [title]="'stock.freezeHint' | t"
                    (click)="freeze(item)"
                  >
                    ❄️ {{ 'stock.freeze' | t }}
                  </button>
                }
                <div class="flex gap-2">
                  @for (reason of discardReasons; track reason) {
                    <button
                      type="button"
                      class="btn-secondary flex-1 text-danger"
                      [disabled]="pending()"
                      (click)="discard(item, reason)"
                    >
                      {{ 'stock.discardReasons.' + reason | t }}
                    </button>
                  }
                </div>
              </section>
            }

            <button type="button" class="btn-secondary" (click)="selected.set(null)">
              {{ 'app.cancel' | t }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class StockPage implements OnInit {
  protected readonly householdStore = inject(HouseholdStore);
  private readonly householdApi = inject(HouseholdApi);
  private readonly stockApi = inject(StockApi);
  private readonly translateService = inject(TranslateService);

  protected readonly items = signal<StockItem[] | null>(null);
  protected readonly search = signal('');
  protected readonly filter = signal<Filter>('all');
  protected readonly locationFilter = signal('');
  protected readonly kindFilter = signal('');
  protected readonly locations = signal<StorageLocation[]>([]);
  protected readonly pending = signal(false);

  protected readonly kinds: ProductKind[] = ['food', 'cleaning', 'hygiene', 'pet', 'other'];

  /** Lot ouvert dans la fiche d'édition. */
  protected readonly selected = signal<StockItem | null>(null);
  protected editQuantity = 0;
  protected editExpiresAt = '';
  protected editLocationId = '';
  protected consumeQuantity = 1;

  protected readonly discardReasons = ['trashed', 'lost', 'given'] as const;
  protected readonly hasFreezer = computed(() =>
    this.locations().some((location) => location.type === 'freezer'),
  );

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  protected readonly householdId = computed(() => this.householdStore.currentHousehold()?.id);

  async ngOnInit(): Promise<void> {
    const householdId = this.householdId();
    if (householdId) {
      this.locations.set(await this.householdApi.listStorageLocations(householdId));
    }
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

  protected setLocationFilter(locationId: string): void {
    this.locationFilter.set(locationId);
    void this.refresh();
  }

  protected setKindFilter(kind: string): void {
    this.kindFilter.set(kind);
    void this.refresh();
  }

  protected openItem(item: StockItem): void {
    this.selected.set(item);
    this.editQuantity = item.quantity;
    this.editExpiresAt = item.expiresAt ?? '';
    this.editLocationId = item.storageLocationId ?? '';
    this.consumeQuantity = Math.min(item.quantity, 1) || 1;
  }

  protected async saveEdit(item: StockItem): Promise<void> {
    const householdId = this.householdId();
    if (!householdId) {
      return;
    }
    this.pending.set(true);
    try {
      await this.stockApi.updateItem(householdId, item.id, {
        quantity: this.editQuantity,
        storageLocationId: this.editLocationId || null,
        expiresAt: this.editExpiresAt || null,
      });
      this.selected.set(null);
      await this.refresh();
    } finally {
      this.pending.set(false);
    }
  }

  protected async consumeAll(item: StockItem): Promise<void> {
    await this.runAction(() => this.stockApi.consume(this.householdId()!, item.id));
  }

  protected async consumePartial(item: StockItem): Promise<void> {
    if (this.consumeQuantity <= 0) {
      return;
    }
    await this.runAction(() =>
      this.stockApi.consume(this.householdId()!, item.id, this.consumeQuantity),
    );
  }

  protected async discard(item: StockItem, reason: 'trashed' | 'lost' | 'given'): Promise<void> {
    await this.runAction(() => this.stockApi.discard(this.householdId()!, item.id, reason));
  }

  /** Congélation (spec 5.22) : congélateur par défaut du foyer. */
  protected async freeze(item: StockItem): Promise<void> {
    await this.runAction(() => this.stockApi.freeze(this.householdId()!, item.id));
  }

  /** Badge de péremption : périmé / aujourd'hui / dans N jours (≤ 7 j). */
  protected expiryLabel(item: StockItem): string | null {
    if (!item.expiresAt) {
      return null;
    }
    if (item.isExpired) {
      return this.translateService.translate('stock.expired');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(item.expiresAt);
    const days = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
    if (days === 0) {
      return this.translateService.translate('stock.expiresToday');
    }
    if (days <= 7) {
      return this.translateService.translate('stock.expiresInDays', { days });
    }
    return null;
  }

  private async runAction(action: () => Promise<unknown>): Promise<void> {
    if (!this.householdId()) {
      return;
    }
    this.pending.set(true);
    try {
      await action();
      this.selected.set(null);
      await this.refresh();
    } finally {
      this.pending.set(false);
    }
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
        storageLocationId: this.locationFilter() || undefined,
        kind: this.kindFilter() || undefined,
      }),
    );
  }
}
