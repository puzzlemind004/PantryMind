import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { HouseholdApi } from '../../core/household/household-api';
import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { BarcodeScanner } from './barcode-scanner';
import { StockApi } from './stock-api';
import type {
  ExternalProductData,
  Product,
  ProductReference,
  StorageLocation,
  Unit,
} from '../../core/api/types';

const UNITS: Unit[] = ['g', 'kg', 'ml', 'cl', 'l', 'unit'];

/**
 * Ajout au stock (spec §8.4) : scan de code-barres prioritaire,
 * recherche catalogue, création manuelle — puis quantité, emplacement
 * et DLC préremplis autant que possible (spec §9.3).
 */
@Component({
  selector: 'app-add-stock-page',
  imports: [FormsModule, RouterLink, TranslatePipe, BarcodeScanner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <header class="flex items-center gap-3">
        <a routerLink="/stock" class="text-muted" [attr.aria-label]="'app.back' | t">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </a>
        <h1 class="text-xl font-bold">{{ 'stock.addTitle' | t }}</h1>
      </header>

      @if (!selectedProduct()) {
        <!-- Étape 1 : choisir / scanner / créer un produit -->
        @if (scanning()) {
          <app-barcode-scanner (detected)="onBarcode($event)" />
          @if (scanStatus() === 'searching') {
            <p class="text-center text-sm text-muted">{{ 'scan.searching' | t }}</p>
          } @else if (scanStatus() === 'notFound') {
            <p class="text-center text-sm text-muted">{{ 'scan.notFound' | t }}</p>
          }
          <button class="btn-secondary" type="button" (click)="scanning.set(false)">
            {{ 'app.cancel' | t }}
          </button>
        } @else {
          <button class="btn-primary" type="button" (click)="startScan()">
            {{ 'stock.scan' | t }}
          </button>

          <input
            class="input"
            type="search"
            name="productSearch"
            [placeholder]="'stock.searchPlaceholder' | t"
            [ngModel]="productSearch()"
            (ngModelChange)="onProductSearch($event)"
          />

          <ul class="flex flex-col gap-2">
            @for (product of productResults(); track product.id) {
              <li>
                <button
                  type="button"
                  class="card w-full !p-3 text-left transition-colors hover:border-primary"
                  (click)="selectProduct(product)"
                >
                  <span class="font-medium">{{ product.name }}</span>
                  @if (product.category) {
                    <span class="ml-2 text-xs text-muted">{{ product.category }}</span>
                  }
                </button>
              </li>
            }
            @if (productSearch().trim().length > 1 && !searching()) {
              <li>
                <button
                  type="button"
                  class="btn-secondary w-full"
                  (click)="createProduct(productSearch().trim())"
                >
                  {{ 'stock.createProduct' | t: { name: productSearch().trim() } }}
                </button>
              </li>
            }
          </ul>
        }
      } @else {
        <!-- Étape 2 : quantité, unité, emplacement, DLC -->
        <section class="card flex flex-col gap-1 !py-3">
          @if (externalData()) {
            <!-- Produit issu d'Open Food Facts : le nom générique alimente le
                 catalogue des recettes, autant le nettoyer tout de suite
                 (« Penne Rigate Panzani » → « Pâtes »). -->
            <label class="flex flex-col gap-1">
              <span class="text-sm font-medium">{{ 'stock.genericName' | t }}</span>
              <input class="input" type="text" name="genericName" [(ngModel)]="genericName" />
            </label>
            <p class="text-sm text-muted">
              {{ externalData()!.name }}
              @if (externalData()!.brand) {
                · {{ externalData()!.brand }}
              }
            </p>
          } @else {
            <p class="font-semibold">{{ selectedProduct()!.name }}</p>
            @if (selectedReference()?.brand) {
              <p class="text-sm text-muted">{{ selectedReference()?.brand }}</p>
            }
          }
          <button type="button" class="mt-1 self-start text-sm text-primary" (click)="reset()">
            {{ 'app.back' | t }}
          </button>
        </section>

        <form class="card flex flex-col gap-4" (ngSubmit)="submit()">
          <div class="flex gap-3">
            <label class="flex flex-1 flex-col gap-1">
              <span class="text-sm font-medium">{{ 'stock.quantity' | t }}</span>
              <input
                class="input"
                type="number"
                name="quantity"
                inputmode="decimal"
                min="0.001"
                step="any"
                required
                [(ngModel)]="quantity"
              />
            </label>
            <label class="flex w-32 flex-col gap-1">
              <span class="text-sm font-medium">{{ 'stock.unit' | t }}</span>
              <select class="input" name="unit" [(ngModel)]="unit">
                @for (option of units; track option) {
                  <option [value]="option">{{ 'units.' + option | t }}</option>
                }
              </select>
            </label>
          </div>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium">{{ 'stock.location' | t }}</span>
            <select class="input" name="location" [(ngModel)]="storageLocationId">
              @for (location of locations(); track location.id) {
                <option [value]="location.id">{{ location.name }}</option>
              }
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium">{{ 'stock.expiryDate' | t }}</span>
            <input class="input" type="date" name="expiresAt" [(ngModel)]="expiresAt" />
          </label>

          @if (error()) {
            <p class="error-text">{{ 'app.error' | t }}</p>
          }

          <button class="btn-primary" type="submit" [disabled]="pending() || quantity <= 0">
            {{ 'stock.add' | t }}
          </button>
        </form>
      }
    </div>
  `,
})
export class AddStockPage implements OnInit {
  private readonly householdStore = inject(HouseholdStore);
  private readonly householdApi = inject(HouseholdApi);
  private readonly stockApi = inject(StockApi);
  private readonly router = inject(Router);

  protected readonly units = UNITS;
  protected readonly locations = signal<StorageLocation[]>([]);

  async ngOnInit(): Promise<void> {
    const householdId = this.householdId;
    if (householdId) {
      this.locations.set(await this.householdApi.listStorageLocations(householdId));
      this.storageLocationId ||= this.locations()[0]?.id ?? '';
    }
  }

  /* Étape 1 */
  protected readonly productSearch = signal('');
  protected readonly productResults = signal<Product[]>([]);
  protected readonly searching = signal(false);
  protected readonly scanning = signal(false);
  protected readonly scanStatus = signal<'idle' | 'searching' | 'notFound'>('idle');

  /* Étape 2 */
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly selectedReference = signal<ProductReference | null>(null);
  protected readonly externalData = signal<ExternalProductData | null>(null);
  protected quantity = 1;
  protected unit: Unit = 'g';
  protected storageLocationId = '';
  protected expiresAt = '';
  /** Nom du produit générique, éditable pour les produits importés d'OFF. */
  protected genericName = '';
  protected readonly pending = signal(false);
  protected readonly error = signal(false);

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  private get householdId(): string | undefined {
    return this.householdStore.currentHousehold()?.id;
  }

  protected onProductSearch(value: string): void {
    this.productSearch.set(value);
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => void this.runSearch(), 250);
  }

  protected selectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.unit = product.defaultUnit;
    this.storageLocationId ||= this.locations()[0]?.id ?? '';
  }

  protected async createProduct(name: string): Promise<void> {
    if (!this.householdId) {
      return;
    }
    const product = await this.stockApi.createProduct(this.householdId, { name });
    this.selectProduct(product);
  }

  protected startScan(): void {
    this.scanStatus.set('idle');
    this.scanning.set(true);
  }

  /** Scan : référence locale, sinon proposition Open Food Facts (spec §8.10). */
  protected async onBarcode(barcode: string): Promise<void> {
    if (!this.householdId) {
      return;
    }
    this.scanStatus.set('searching');
    try {
      const lookup = await this.stockApi.lookupBarcode(this.householdId, barcode);
      this.scanning.set(false);

      if (lookup.status === 'local') {
        this.selectProduct(lookup.product);
        this.selectedReference.set(lookup.reference);
        this.prefillFromPackage(lookup.reference.packageQuantity, lookup.reference.packageUnit);
      } else {
        /** Produit connu d'OFF : produit + référence créés à la validation. */
        this.externalData.set(lookup.external);
        this.genericName = lookup.external.name;
        this.selectedProduct.set({
          id: '',
          name: lookup.external.name,
          category: lookup.external.categories[0] ?? null,
          defaultUnit: 'g',
          unitWeightGrams: null,
          densityGPerMl: null,
          nutritionPer100: lookup.external.nutritionPer100,
          allergens: lookup.external.allergens,
          isGlobal: true,
        });
        this.prefillFromPackage(lookup.external.packageQuantity, lookup.external.packageUnit);
        this.storageLocationId ||= this.locations()[0]?.id ?? '';
      }
    } catch {
      this.scanStatus.set('notFound');
      this.scanning.set(false);
    }
  }

  protected async submit(): Promise<void> {
    const householdId = this.householdId;
    const product = this.selectedProduct();
    if (!householdId || !product || this.quantity <= 0) {
      return;
    }

    this.pending.set(true);
    this.error.set(false);
    try {
      let productId = product.id;
      let productReferenceId = this.selectedReference()?.id ?? null;

      /** Produit issu d'OFF : persiste produit + référence maintenant. */
      const external = this.externalData();
      if (!productId && external) {
        const created = await this.stockApi.createReference(householdId, {
          newProduct: { name: this.genericName.trim() || external.name, defaultUnit: this.unit },
          barcode: external.barcode,
          name: external.name,
          brand: external.brand,
          packageQuantity: external.packageQuantity,
          packageUnit: this.isUnit(external.packageUnit) ? external.packageUnit : null,
          nutritionPer100: external.nutritionPer100,
          imageUrl: external.imageUrl,
          source: 'off',
        });
        productId = created.product.id;
        productReferenceId = created.reference.id;
      }

      await this.stockApi.addItem(householdId, {
        productId,
        productReferenceId,
        quantity: this.quantity,
        unit: this.unit,
        storageLocationId: this.storageLocationId || null,
        expiresAt: this.expiresAt || null,
      });
      await this.router.navigateByUrl('/stock');
    } catch {
      this.error.set(true);
    } finally {
      this.pending.set(false);
    }
  }

  protected reset(): void {
    this.selectedProduct.set(null);
    this.selectedReference.set(null);
    this.externalData.set(null);
    this.scanStatus.set('idle');
  }

  private prefillFromPackage(packageQuantity: number | null, packageUnit: string | null): void {
    if (packageQuantity && this.isUnit(packageUnit)) {
      this.quantity = packageQuantity;
      this.unit = packageUnit;
    }
  }

  private isUnit(value: string | null): value is Unit {
    return value !== null && (UNITS as string[]).includes(value);
  }

  private async runSearch(): Promise<void> {
    const search = this.productSearch().trim();
    if (!this.householdId || search.length < 2) {
      this.productResults.set([]);
      return;
    }
    this.searching.set(true);
    try {
      this.productResults.set(await this.stockApi.searchProducts(this.householdId, search));
    } finally {
      this.searching.set(false);
    }
  }
}
