import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { StockApi } from '../stock/stock-api';
import { RecipesApi } from './recipes-api';
import type {
  Product,
  Recipe,
  RecipeFeasibility,
  RecipeNutrition,
  Unit,
} from '../../core/api/types';

interface IngredientDraft {
  productId: string;
  productName: string;
  quantity: number;
  unit: Unit;
  optional: boolean;
}

const UNITS: Unit[] = ['g', 'kg', 'ml', 'cl', 'l', 'unit'];

/** Création / édition / détail d'une recette (spec §8.8). */
@Component({
  selector: 'app-recipe-edit-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <header class="flex items-center gap-3">
        <a routerLink="/recipes" class="text-muted" [attr.aria-label]="'app.back' | t">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </a>
        <h1 class="min-w-0 flex-1 truncate text-xl font-bold">
          {{ isNew() ? ('recipes.add' | t) : name || '…' }}
        </h1>
        @if (!isNew()) {
          <button type="button" class="btn-secondary text-sm" (click)="duplicate()">
            {{ 'recipes.duplicate' | t }}
          </button>
        }
      </header>

      @if (feasibility(); as f) {
        <p
          class="rounded-xl px-3 py-2 text-sm font-medium"
          [class.bg-primary-soft]="f.feasible"
          [class.text-primary]="f.feasible"
          [class.bg-surface]="!f.feasible"
          [class.text-warning]="!f.feasible"
        >
          {{ (f.feasible ? 'recipes.feasible' : 'recipes.notFeasible') | t }}
        </p>
      }

      @if (nutrition(); as n) {
        <section class="card !py-3">
          <h2 class="text-sm font-semibold text-muted">
            {{ 'nutrition.title' | t }} — {{ 'nutrition.perServing' | t }}
          </h2>
          <p class="mt-1 flex flex-wrap gap-3 text-sm">
            <span class="font-semibold">{{ n.perServing.kcal ?? '—' }} {{ 'nutrition.kcal' | t }}</span>
            <span>{{ 'nutrition.proteins' | t }} {{ n.perServing.proteins ?? '—' }} g</span>
            <span>{{ 'nutrition.carbohydrates' | t }} {{ n.perServing.carbohydrates ?? '—' }} g</span>
            <span>{{ 'nutrition.fat' | t }} {{ n.perServing.fat ?? '—' }} g</span>
          </p>
          @if (n.missingProducts.length > 0) {
            <p class="mt-1 text-xs text-muted">
              {{ 'nutrition.missingData' | t: { products: n.missingProducts.join(', ') } }}
            </p>
          }
        </section>
      }

      <form class="flex flex-col gap-4" (ngSubmit)="save()">
        <section class="card flex flex-col gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium">{{ 'recipes.name' | t }}</span>
            <input class="input" type="text" name="name" required [(ngModel)]="name" />
          </label>
          <div class="flex gap-3">
            <label class="flex flex-1 flex-col gap-1">
              <span class="text-sm font-medium">{{ 'recipes.servingsLabel' | t }}</span>
              <input class="input" type="number" name="servings" min="1" max="50" [(ngModel)]="servings" />
            </label>
            <label class="flex flex-1 flex-col gap-1">
              <span class="text-sm font-medium">{{ 'recipes.prepMinutes' | t }}</span>
              <input class="input" type="number" name="prep" min="0" [(ngModel)]="prepMinutes" />
            </label>
            <label class="flex flex-1 flex-col gap-1">
              <span class="text-sm font-medium">{{ 'recipes.cookMinutes' | t }}</span>
              <input class="input" type="number" name="cook" min="0" [(ngModel)]="cookMinutes" />
            </label>
          </div>
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium">{{ 'recipes.tags' | t }}</span>
            <input
              class="input"
              type="text"
              name="tags"
              [placeholder]="'recipes.tagsPlaceholder' | t"
              [(ngModel)]="tagsText"
            />
          </label>
        </section>

        <!-- Ingrédients -->
        <section class="card flex flex-col gap-3">
          <h2 class="font-semibold">{{ 'recipes.ingredients' | t }}</h2>

          @for (ingredient of ingredients(); track $index) {
            <div class="flex items-center gap-2">
              <span class="min-w-0 flex-1 truncate text-sm">{{ ingredient.productName }}</span>
              <input
                class="input !w-20 !px-2 text-right"
                type="number"
                [name]="'qty' + $index"
                min="0.001"
                step="any"
                [ngModel]="ingredient.quantity"
                (ngModelChange)="setQuantity($index, $event)"
              />
              <select
                class="input !w-24 !px-2"
                [name]="'unit' + $index"
                [ngModel]="ingredient.unit"
                (ngModelChange)="setUnit($index, $event)"
              >
                @for (unit of units; track unit) {
                  <option [value]="unit">{{ 'units.' + unit | t }}</option>
                }
              </select>
              <label class="flex shrink-0 items-center gap-1 text-xs text-muted">
                <input
                  type="checkbox"
                  [name]="'opt' + $index"
                  [ngModel]="ingredient.optional"
                  (ngModelChange)="setOptional($index, $event)"
                />
                {{ 'recipes.optional' | t }}
              </label>
              <button type="button" class="shrink-0 text-danger" (click)="removeIngredient($index)">✕</button>
            </div>
          }

          <input
            class="input"
            type="search"
            name="productSearch"
            [placeholder]="'recipes.searchProduct' | t"
            [ngModel]="productSearch()"
            (ngModelChange)="onProductSearch($event)"
          />
          @if (productResults().length > 0) {
            <ul class="flex flex-col gap-1">
              @for (product of productResults(); track product.id) {
                <li>
                  <button
                    type="button"
                    class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface"
                    (click)="addIngredient(product)"
                  >
                    + {{ product.name }}
                  </button>
                </li>
              }
            </ul>
          }
        </section>

        <!-- Étapes -->
        <section class="card flex flex-col gap-3">
          <h2 class="font-semibold">{{ 'recipes.steps' | t }}</h2>
          @for (step of steps(); track $index) {
            <div class="flex items-start gap-2">
              <span class="mt-2 shrink-0 text-sm font-bold text-primary">{{ $index + 1 }}.</span>
              <textarea
                class="input min-h-16 flex-1"
                [name]="'step' + $index"
                [placeholder]="'recipes.stepPlaceholder' | t"
                [ngModel]="step"
                (ngModelChange)="setStep($index, $event)"
              ></textarea>
              <button type="button" class="mt-2 shrink-0 text-danger" (click)="removeStep($index)">✕</button>
            </div>
          }
          <button type="button" class="btn-secondary text-sm" (click)="addStep()">
            + {{ 'recipes.addStep' | t }}
          </button>
        </section>

        @if (error()) {
          <p class="error-text">{{ 'app.error' | t }}</p>
        }

        <button
          class="btn-primary"
          type="submit"
          [disabled]="pending() || !name.trim() || ingredients().length === 0"
        >
          {{ 'app.save' | t }}
        </button>

        @if (!isNew()) {
          <button type="button" class="btn-secondary text-danger" (click)="remove()">
            {{ 'app.delete' | t }}
          </button>
        }
      </form>
    </div>
  `,
})
export class RecipeEditPage implements OnInit {
  /** Route param — absent en création. */
  readonly recipeId = input<string>();

  private readonly householdStore = inject(HouseholdStore);
  private readonly recipesApi = inject(RecipesApi);
  private readonly stockApi = inject(StockApi);
  private readonly router = inject(Router);

  protected readonly units = UNITS;
  protected name = '';
  protected servings = 4;
  protected prepMinutes: number | null = null;
  protected cookMinutes: number | null = null;
  protected tagsText = '';
  protected readonly ingredients = signal<IngredientDraft[]>([]);
  protected readonly steps = signal<string[]>([]);
  protected readonly feasibility = signal<RecipeFeasibility | null>(null);
  protected readonly nutrition = signal<RecipeNutrition | null>(null);

  protected readonly productSearch = signal('');
  protected readonly productResults = signal<Product[]>([]);
  protected readonly pending = signal(false);
  protected readonly error = signal(false);

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  protected isNew(): boolean {
    return !this.recipeId();
  }

  private get householdId(): string | undefined {
    return this.householdStore.currentHousehold()?.id;
  }

  async ngOnInit(): Promise<void> {
    const recipeId = this.recipeId();
    if (!recipeId || !this.householdId) {
      return;
    }
    const recipe = await this.recipesApi.get(this.householdId, recipeId);
    this.hydrate(recipe);
    const [feasibility, nutrition] = await Promise.all([
      this.recipesApi.feasibility(this.householdId, recipeId),
      this.recipesApi.nutrition(this.householdId, recipeId),
    ]);
    this.feasibility.set(feasibility);
    this.nutrition.set(nutrition);
  }

  protected onProductSearch(value: string): void {
    this.productSearch.set(value);
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => void this.runProductSearch(), 250);
  }

  protected addIngredient(product: Product): void {
    this.ingredients.update((list) => [
      ...list,
      {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unit: product.defaultUnit,
        optional: false,
      },
    ]);
    this.productSearch.set('');
    this.productResults.set([]);
  }

  protected removeIngredient(index: number): void {
    this.ingredients.update((list) => list.filter((_, i) => i !== index));
  }

  protected setQuantity(index: number, quantity: number): void {
    this.ingredients.update((list) =>
      list.map((item, i) => (i === index ? { ...item, quantity } : item)),
    );
  }

  protected setUnit(index: number, unit: Unit): void {
    this.ingredients.update((list) =>
      list.map((item, i) => (i === index ? { ...item, unit } : item)),
    );
  }

  protected setOptional(index: number, optional: boolean): void {
    this.ingredients.update((list) =>
      list.map((item, i) => (i === index ? { ...item, optional } : item)),
    );
  }

  protected addStep(): void {
    this.steps.update((list) => [...list, '']);
  }

  protected setStep(index: number, value: string): void {
    this.steps.update((list) => list.map((step, i) => (i === index ? value : step)));
  }

  protected removeStep(index: number): void {
    this.steps.update((list) => list.filter((_, i) => i !== index));
  }

  protected async save(): Promise<void> {
    const householdId = this.householdId;
    if (!householdId || !this.name.trim() || this.ingredients().length === 0) {
      return;
    }
    this.pending.set(true);
    this.error.set(false);
    try {
      const payload = {
        name: this.name.trim(),
        servings: this.servings,
        prepMinutes: this.prepMinutes,
        cookMinutes: this.cookMinutes,
        steps: this.steps().filter((step) => step.trim().length > 0),
        tags: this.tagsText
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        ingredients: this.ingredients().map((ingredient) => ({
          productId: ingredient.productId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          optional: ingredient.optional,
        })),
      };

      const recipeId = this.recipeId();
      if (recipeId) {
        await this.recipesApi.update(householdId, recipeId, payload);
      } else {
        await this.recipesApi.create(householdId, payload);
      }
      await this.router.navigateByUrl('/recipes');
    } catch {
      this.error.set(true);
    } finally {
      this.pending.set(false);
    }
  }

  protected async duplicate(): Promise<void> {
    const householdId = this.householdId;
    const recipeId = this.recipeId();
    if (!householdId || !recipeId) {
      return;
    }
    const copy = await this.recipesApi.duplicate(householdId, recipeId);
    await this.router.navigate(['/recipes', copy.id]);
    this.hydrate(copy);
  }

  protected async remove(): Promise<void> {
    const householdId = this.householdId;
    const recipeId = this.recipeId();
    if (!householdId || !recipeId) {
      return;
    }
    await this.recipesApi.delete(householdId, recipeId);
    await this.router.navigateByUrl('/recipes');
  }

  private hydrate(recipe: Recipe): void {
    this.name = recipe.name;
    this.servings = recipe.servings;
    this.prepMinutes = recipe.prepMinutes;
    this.cookMinutes = recipe.cookMinutes;
    this.tagsText = recipe.tags.join(', ');
    this.steps.set([...recipe.steps]);
    this.ingredients.set(
      (recipe.ingredients ?? []).map((ingredient) => ({
        productId: ingredient.productId,
        productName: ingredient.product?.name ?? '?',
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        optional: ingredient.optional,
      })),
    );
  }

  private async runProductSearch(): Promise<void> {
    const search = this.productSearch().trim();
    if (!this.householdId || search.length < 2) {
      this.productResults.set([]);
      return;
    }
    this.productResults.set(await this.stockApi.searchProducts(this.householdId, search));
  }
}
