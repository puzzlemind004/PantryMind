import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HouseholdApi } from '../../core/household/household-api';
import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { RecipesApi } from '../recipes/recipes-api';
import { PlanningApi } from './planning-api';
import type {
  DailyNutrition,
  MealType,
  PlannedMeal,
  Recipe,
  Recommendation,
} from '../../core/api/types';

const DAY_MS = 86_400_000;
const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Lundi de la semaine contenant `date`. */
function mondayOf(date: Date): Date {
  const day = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  monday.setHours(12, 0, 0, 0);
  return monday;
}

/** Vue hebdomadaire du planning (spec §8.5). */
@Component({
  selector: 'app-planning-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-3 p-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'planning.title' | t }}</h1>
        <div class="flex items-center gap-1">
          <button type="button" class="btn-secondary !px-3" (click)="shiftWeek(-1)" aria-label="◀">◀</button>
          <button type="button" class="btn-secondary text-sm" (click)="goToday()">
            {{ 'planning.today' | t }}
          </button>
          <button type="button" class="btn-secondary !px-3" (click)="shiftWeek(1)" aria-label="▶">▶</button>
        </div>
      </header>

      <p class="text-center text-sm text-muted">{{ weekLabel() }}</p>

      @if (conflict()) {
        <p class="rounded-xl bg-surface px-3 py-2 text-sm text-warning">
          {{ 'planning.conflict' | t }}
        </p>
      }

      @if (todayNutrition(); as nutrition) {
        @if (nutrition.meals.length > 0) {
          <section class="card !py-3">
            <h2 class="text-sm font-semibold text-muted">{{ 'nutrition.today' | t }}</h2>
            <p class="mt-1 flex flex-wrap gap-3 text-sm">
              <span class="font-semibold">
                {{ nutrition.totals.kcal ?? '—' }} {{ 'nutrition.kcal' | t }}
              </span>
              <span>{{ 'nutrition.proteins' | t }} {{ nutrition.totals.proteins ?? '—' }} g</span>
              <span>{{ 'nutrition.carbohydrates' | t }} {{ nutrition.totals.carbohydrates ?? '—' }} g</span>
              <span>{{ 'nutrition.fat' | t }} {{ nutrition.totals.fat ?? '—' }} g</span>
            </p>
          </section>
        }
      }

      @for (day of days(); track day.date) {
        <section class="card !p-3">
          <h2 class="flex items-baseline justify-between text-sm font-semibold">
            <span [class.text-primary]="day.isToday">{{ day.label }} {{ day.dayOfMonth }}</span>
            <button
              type="button"
              class="text-xs font-medium text-primary"
              (click)="openAddMeal(day.date)"
            >
              + {{ 'planning.addMeal' | t }}
            </button>
          </h2>

          @if (day.meals.length > 0) {
            <ul class="mt-2 flex flex-col gap-2">
              @for (meal of day.meals; track meal.id) {
                <li
                  class="rounded-xl border border-line p-2"
                  [class.opacity-50]="meal.status === 'cancelled'"
                >
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-medium">
                      {{ meal.mealName }}
                      @if (meal.effectiveTime) {
                        <span class="text-xs text-muted">· {{ meal.effectiveTime }}</span>
                      }
                    </p>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs"
                      [class.bg-primary-soft]="meal.status === 'done'"
                      [class.text-primary]="meal.status === 'done'"
                      [class.bg-surface]="meal.status !== 'done'"
                    >
                      {{ 'planning.statuses.' + meal.status | t }}
                    </span>
                  </div>

                  @if ((meal.recipes ?? []).length > 0) {
                    <p class="mt-1 flex flex-wrap gap-1">
                      @for (mealRecipe of meal.recipes; track mealRecipe.id) {
                        <span class="rounded-full bg-surface px-2 py-0.5 text-xs">
                          {{ mealRecipe.snapshot.name }} × {{ mealRecipe.servings }}
                        </span>
                      }
                    </p>
                  } @else {
                    <p class="mt-1 text-xs text-muted">{{ 'planning.noRecipes' | t }}</p>
                  }

                  @if (meal.status === 'planned') {
                    <div class="mt-2 flex flex-wrap gap-2">
                      <a
                        [routerLink]="['/planning/meals', meal.id, 'validate']"
                        class="btn-primary !w-auto !px-3 !py-1 text-xs"
                      >
                        {{ 'planning.validate' | t }}
                      </a>
                      <button
                        type="button"
                        class="btn-secondary !px-3 !py-1 text-xs"
                        (click)="openDuplicate(meal)"
                      >
                        {{ 'planning.duplicateMulti' | t }}
                      </button>
                      <button
                        type="button"
                        class="btn-secondary !px-3 !py-1 text-xs text-danger"
                        (click)="deleteMeal(meal)"
                      >
                        {{ 'planning.deleteMeal' | t }}
                      </button>
                    </div>
                  }
                </li>
              }
            </ul>
          } @else {
            <p class="mt-1 text-xs text-muted">{{ 'planning.emptyDay' | t }}</p>
          }
        </section>
      }

      <!-- Duplication multi-jours (spec §6.4) -->
      @if (duplicating(); as meal) {
        <div
          class="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          (click)="duplicating.set(null)"
        >
          <div
            class="card flex w-full max-w-lg flex-col gap-3 rounded-b-none border-primary sm:rounded-b-[var(--radius-card)]"
            (click)="$event.stopPropagation()"
          >
            <h2 class="font-semibold">{{ meal.mealName }} — {{ 'planning.duplicateDays' | t }}</h2>

            <div class="grid grid-cols-2 gap-1">
              @for (option of duplicateOptions(); track option.iso) {
                <label
                  class="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                  [class.border-primary]="duplicateTargets().has(option.iso)"
                  [class.border-line]="!duplicateTargets().has(option.iso)"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-[var(--color-primary)]"
                    [checked]="duplicateTargets().has(option.iso)"
                    (change)="toggleDuplicateTarget(option.iso)"
                  />
                  {{ option.label }}
                </label>
              }
            </div>
            <button type="button" class="btn-secondary text-sm" (click)="selectWholeWeek()">
              {{ 'planning.duplicateWholeWeek' | t }}
            </button>

            <div class="flex gap-2">
              <button
                type="button"
                class="btn-primary flex-1"
                [disabled]="duplicateTargets().size === 0 || saving()"
                (click)="confirmDuplicate()"
              >
                {{ 'planning.duplicateConfirm' | t: { count: duplicateTargets().size } }}
              </button>
              <button type="button" class="btn-secondary" (click)="duplicating.set(null)">
                {{ 'app.cancel' | t }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Ajout de repas : modal plein écran mobile (retour utilisateur :
           le formulaire en bas de page obligeait à scroller) -->
      @if (addingDate(); as date) {
        <div
          class="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          (click)="addingDate.set(null)"
        >
          <div
            class="card flex w-full max-w-lg flex-col gap-3 rounded-b-none border-primary sm:rounded-b-[var(--radius-card)]"
            (click)="$event.stopPropagation()"
          >
            <h2 class="font-semibold">{{ 'planning.addMeal' | t }} — {{ date }}</h2>

            @if (suggestions().length > 0) {
              <div class="flex flex-col gap-1">
                <h3 class="text-sm font-semibold text-muted">{{ 'suggestions.title' | t }}</h3>
                @for (suggestion of suggestions(); track suggestion.recipeId) {
                  <button
                    type="button"
                    class="rounded-xl border px-3 py-2 text-left text-sm transition-colors"
                    [class.border-primary]="newRecipeId === suggestion.recipeId"
                    [class.border-line]="newRecipeId !== suggestion.recipeId"
                    (click)="pickSuggestion(suggestion)"
                  >
                    <span class="font-medium">{{ suggestion.recipeName }}</span>
                    <span class="mt-0.5 flex flex-wrap gap-1">
                      @for (reason of suggestion.reasons.slice(0, 2); track reason.code) {
                        <span class="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                          {{ 'suggestions.reasons.' + reason.code | t: reason.params }}
                        </span>
                      }
                    </span>
                  </button>
                }
              </div>
            }

            @if (mealTypes().length === 0) {
              <p class="error-text">{{ 'planning.noMealTypes' | t }}</p>
            } @else {
              <label class="flex flex-col gap-1">
                <span class="text-sm font-medium">{{ 'planning.mealType' | t }}</span>
                <select class="input" name="mealType" [(ngModel)]="newMealTypeId">
                  @for (type of mealTypes(); track type.id) {
                    <option [value]="type.id">{{ type.name }} ({{ type.defaultTime }})</option>
                  }
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-sm font-medium">{{ 'planning.addRecipe' | t }}</span>
                <select class="input" name="recipe" [(ngModel)]="newRecipeId">
                  <option value="">{{ 'planning.noRecipes' | t }}</option>
                  @for (recipe of recipes(); track recipe.id) {
                    <option [value]="recipe.id">{{ recipe.name }}</option>
                  }
                </select>
              </label>
              @if (newRecipeId) {
                <label class="flex flex-col gap-1">
                  <span class="text-sm font-medium">{{ 'planning.servingsLabel' | t }}</span>
                  <input class="input" type="number" name="servings" min="0.5" step="0.5" [(ngModel)]="newServings" />
                </label>
              }
            }

            <div class="flex gap-2">
              <button
                type="button"
                class="btn-primary flex-1"
                [disabled]="!newMealTypeId || saving()"
                (click)="createMeal()"
              >
                {{ 'app.save' | t }}
              </button>
              <button type="button" class="btn-secondary" (click)="addingDate.set(null)">
                {{ 'app.cancel' | t }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PlanningPage implements OnInit {
  private readonly householdStore = inject(HouseholdStore);
  private readonly householdApi = inject(HouseholdApi);
  private readonly planningApi = inject(PlanningApi);
  private readonly recipesApi = inject(RecipesApi);

  protected readonly weekStart = signal(mondayOf(new Date()));
  protected readonly meals = signal<PlannedMeal[]>([]);
  protected readonly mealTypes = signal<MealType[]>([]);
  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly conflict = signal(false);
  protected readonly saving = signal(false);
  protected readonly todayNutrition = signal<DailyNutrition | null>(null);
  protected readonly suggestions = signal<Recommendation[]>([]);

  /** Duplication multi-jours (spec §6.4) : repas source + jours cochés. */
  protected readonly duplicating = signal<PlannedMeal | null>(null);
  protected readonly duplicateTargets = signal<Set<string>>(new Set());
  protected readonly duplicateOptions = computed(() => {
    const meal = this.duplicating();
    if (!meal) {
      return [];
    }
    const origin = new Date(meal.date + 'T12:00:00');
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(origin.getTime() + (index + 1) * DAY_MS);
      return {
        iso: toIsoDate(date),
        label: `${DAY_LABELS[(date.getDay() + 6) % 7]} ${date.getDate()}/${date.getMonth() + 1}`,
      };
    });
  });

  protected readonly addingDate = signal<string | null>(null);
  protected newMealTypeId = '';
  protected newRecipeId = '';
  protected newServings = 2;

  protected readonly weekLabel = computed(() => {
    const start = this.weekStart();
    const end = new Date(start.getTime() + 6 * DAY_MS);
    return `${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  });

  protected readonly days = computed(() => {
    const start = this.weekStart();
    const todayIso = toIsoDate(new Date());
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start.getTime() + index * DAY_MS);
      const iso = toIsoDate(date);
      return {
        date: iso,
        label: DAY_LABELS[index],
        dayOfMonth: date.getDate(),
        isToday: iso === todayIso,
        meals: this.meals().filter((meal) => meal.date === iso),
      };
    });
  });

  private get householdId(): string | undefined {
    return this.householdStore.currentHousehold()?.id;
  }

  async ngOnInit(): Promise<void> {
    if (!this.householdId) {
      return;
    }
    /** Endpoint dédié : indépendant de la profondeur de sérialisation du détail foyer. */
    const [mealTypes, recipes] = await Promise.all([
      this.householdApi.listMealTypes(this.householdId),
      this.recipesApi.list(this.householdId),
    ]);
    this.mealTypes.set(mealTypes);
    this.recipes.set(recipes);
    this.newMealTypeId = this.mealTypes()[0]?.id ?? '';
    await this.refresh();
  }

  protected shiftWeek(offset: number): void {
    this.weekStart.set(new Date(this.weekStart().getTime() + offset * 7 * DAY_MS));
    void this.refresh();
  }

  protected goToday(): void {
    this.weekStart.set(mondayOf(new Date()));
    void this.refresh();
  }

  protected openAddMeal(date: string): void {
    this.addingDate.set(date);
    this.newRecipeId = '';
    void this.loadSuggestions();
  }

  protected pickSuggestion(suggestion: Recommendation): void {
    this.newRecipeId = suggestion.recipeId;
  }

  private async loadSuggestions(): Promise<void> {
    if (!this.householdId) {
      return;
    }
    try {
      const { recommendations } = await this.recipesApi.recommendations(this.householdId, 3);
      this.suggestions.set(recommendations);
    } catch {
      this.suggestions.set([]);
    }
  }

  protected async createMeal(): Promise<void> {
    const householdId = this.householdId;
    const date = this.addingDate();
    if (!householdId || !date || !this.newMealTypeId) {
      return;
    }
    this.saving.set(true);
    try {
      await this.planningApi.create(householdId, {
        date,
        mealTypeId: this.newMealTypeId,
        recipes: this.newRecipeId
          ? [{ recipeId: this.newRecipeId, servings: this.newServings }]
          : [],
      });
      this.addingDate.set(null);
      await this.refresh();
    } finally {
      this.saving.set(false);
    }
  }

  protected async deleteMeal(meal: PlannedMeal): Promise<void> {
    if (!this.householdId) {
      return;
    }
    await this.planningApi.delete(this.householdId, meal.id);
    await this.refresh();
  }

  protected openDuplicate(meal: PlannedMeal): void {
    this.duplicating.set(meal);
    this.duplicateTargets.set(new Set());
  }

  protected toggleDuplicateTarget(iso: string): void {
    this.duplicateTargets.update((targets) => {
      const next = new Set(targets);
      if (next.has(iso)) {
        next.delete(iso);
      } else {
        next.add(iso);
      }
      return next;
    });
  }

  protected selectWholeWeek(): void {
    this.duplicateTargets.set(new Set(this.duplicateOptions().map((option) => option.iso)));
  }

  protected async confirmDuplicate(): Promise<void> {
    const meal = this.duplicating();
    if (!this.householdId || !meal || this.duplicateTargets().size === 0) {
      return;
    }
    this.saving.set(true);
    try {
      await this.planningApi.duplicate(this.householdId, meal.id, [...this.duplicateTargets()].sort());
      this.duplicating.set(null);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.conflict.set(true);
        this.duplicating.set(null);
      }
    } finally {
      this.saving.set(false);
    }
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    if (!this.householdId) {
      return;
    }
    const from = toIsoDate(this.weekStart());
    const to = toIsoDate(new Date(this.weekStart().getTime() + 6 * DAY_MS));
    this.meals.set(await this.planningApi.list(this.householdId, from, to));
    this.conflict.set(false);

    /** Résumé nutritionnel du jour (spec §2), silencieux en cas d'échec. */
    try {
      this.todayNutrition.set(
        await this.planningApi.dailyNutrition(this.householdId, toIsoDate(new Date())),
      );
    } catch {
      this.todayNutrition.set(null);
    }
  }
}
