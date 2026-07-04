import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { PlanningApi } from './planning-api';
import type { MealNeed, PlannedMeal, Unit } from '../../core/api/types';

interface ConsumptionDraft {
  productId: string;
  productName: string;
  quantity: number;
  unit: Unit;
  optional: boolean;
  available: number;
  missing: number;
  skipped: boolean;
  substitutes: { productId: string; productName: string; available: number }[];
}

/**
 * Validation d'un repas (spec 5.2-5.4, §8.11) : quantités théoriques
 * préremplies et ajustables, manquants signalés, substitutions en un
 * geste, puis consommation du stock.
 */
@Component({
  selector: 'app-meal-validation-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <header class="flex items-center gap-3">
        <a routerLink="/planning" class="text-muted" [attr.aria-label]="'app.back' | t">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </a>
        <div class="min-w-0">
          <h1 class="truncate text-xl font-bold">{{ 'validation.title' | t }}</h1>
          @if (meal(); as m) {
            <p class="text-sm text-muted">{{ m.mealName }} · {{ m.date }}</p>
          }
        </div>
      </header>

      @if (items(); as list) {
        <p class="text-sm text-muted">{{ 'validation.intro' | t }}</p>

        <ul class="flex flex-col gap-2">
          @for (item of list; track item.productId) {
            <li class="card flex flex-col gap-2 !p-3" [class.opacity-50]="item.skipped">
              <div class="flex items-center gap-2">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">
                    {{ item.productName }}
                    @if (item.optional) {
                      <span class="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                        {{ 'validation.optionalTag' | t }}
                      </span>
                    }
                  </p>
                  <p class="text-xs text-muted">
                    {{ item.available }} {{ 'units.' + item.unit | t }} {{ 'validation.available' | t }}
                  </p>
                </div>
                <input
                  class="input !w-24 !px-2 text-right"
                  type="number"
                  [name]="'qty-' + item.productId"
                  min="0"
                  step="any"
                  [disabled]="item.skipped"
                  [ngModel]="item.quantity"
                  (ngModelChange)="setQuantity(item.productId, $event)"
                />
                <span class="w-10 shrink-0 text-sm text-muted">{{ 'units.' + item.unit | t }}</span>
                <button
                  type="button"
                  class="shrink-0 text-xs text-muted underline"
                  (click)="toggleSkip(item.productId)"
                >
                  {{ item.skipped ? '↺' : ('validation.skip' | t) }}
                </button>
              </div>

              @if (!item.skipped && item.quantity > item.available) {
                <p class="text-xs font-medium text-warning">
                  {{
                    'validation.missing'
                      | t: { quantity: round(item.quantity - item.available), unit: item.unit }
                  }}
                </p>
                @for (substitute of item.substitutes; track substitute.productId) {
                  @if (substitute.available > 0) {
                    <button
                      type="button"
                      class="btn-secondary !py-1 text-xs"
                      (click)="applySubstitute(item.productId, substitute.productId, substitute.productName)"
                    >
                      {{
                        'validation.substituteWith'
                          | t: {
                              name: substitute.productName,
                              available: substitute.available,
                              unit: item.unit
                            }
                      }}
                    </button>
                  }
                }
              }
            </li>
          }
        </ul>

        @if (feedback()) {
          <p class="rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
            {{ feedback()! | t }}
          </p>
        }

        <button class="btn-primary" type="button" [disabled]="pending()" (click)="confirm()">
          {{ 'validation.confirm' | t }}
        </button>
      } @else {
        <p class="py-12 text-center text-muted">{{ 'app.loading' | t }}</p>
      }
    </div>
  `,
})
export class MealValidationPage implements OnInit {
  readonly mealId = input.required<string>();

  private readonly householdStore = inject(HouseholdStore);
  private readonly planningApi = inject(PlanningApi);
  private readonly router = inject(Router);

  protected readonly meal = signal<PlannedMeal | null>(null);
  protected readonly items = signal<ConsumptionDraft[] | null>(null);
  protected readonly pending = signal(false);
  protected readonly feedback = signal<string | null>(null);

  private get householdId(): string | undefined {
    return this.householdStore.currentHousehold()?.id;
  }

  async ngOnInit(): Promise<void> {
    if (!this.householdId) {
      return;
    }
    const [meal, preview] = await Promise.all([
      this.planningApi.get(this.householdId, this.mealId()),
      this.planningApi.preview(this.householdId, this.mealId()),
    ]);
    this.meal.set(meal);
    this.items.set(preview.needs.map((need) => this.toDraft(need)));
  }

  protected round(value: number): number {
    return Math.round(value * 1000) / 1000;
  }

  protected setQuantity(productId: string, quantity: number): void {
    this.items.update(
      (list) =>
        list?.map((item) => (item.productId === productId ? { ...item, quantity } : item)) ?? null,
    );
  }

  protected toggleSkip(productId: string): void {
    this.items.update(
      (list) =>
        list?.map((item) =>
          item.productId === productId ? { ...item, skipped: !item.skipped } : item,
        ) ?? null,
    );
  }

  /** Substitution (spec 5.8) : l'item pointe le produit de remplacement. */
  protected applySubstitute(productId: string, substituteId: string, substituteName: string): void {
    this.items.update(
      (list) =>
        list?.map((item) => {
          if (item.productId !== productId) {
            return item;
          }
          const availability = item.substitutes.find((s) => s.productId === substituteId);
          return {
            ...item,
            productId: substituteId,
            productName: substituteName,
            available: availability?.available ?? 0,
            substitutes: [],
          };
        }) ?? null,
    );
  }

  protected async confirm(): Promise<void> {
    const householdId = this.householdId;
    const meal = this.meal();
    const items = this.items();
    if (!householdId || !meal || !items) {
      return;
    }

    this.pending.set(true);
    try {
      const { results } = await this.planningApi.complete(householdId, meal.id, {
        version: meal.version,
        items: items
          .filter((item) => !item.skipped && item.quantity > 0)
          .map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit,
          })),
      });

      const hasMissing = results.some((result) => result.missing > 0);
      this.feedback.set(hasMissing ? 'validation.partial' : 'validation.done');
      setTimeout(() => void this.router.navigateByUrl('/planning'), 1200);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.feedback.set('planning.conflict');
        await this.ngOnInit();
      } else {
        this.feedback.set('app.error');
      }
    } finally {
      this.pending.set(false);
    }
  }

  private toDraft(need: MealNeed): ConsumptionDraft {
    return {
      productId: need.productId,
      productName: need.productName,
      quantity: need.optional ? Math.min(need.quantity, need.available) : need.quantity,
      unit: need.unit,
      optional: need.optional,
      available: need.available,
      missing: need.missing,
      /** Optionnel absent du stock → ignoré par défaut (spec 5.9). */
      skipped: need.optional && need.available <= 0,
      substitutes: need.substitutes,
    };
  }
}
