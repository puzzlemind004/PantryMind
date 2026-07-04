import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HouseholdApi } from '../../core/household/household-api';
import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { RecipesApi } from '../recipes/recipes-api';
import { PlanningApi } from './planning-api';
import type { MealType, PlannedMeal, Recipe } from '../../core/api/types';

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
                        (click)="duplicateNextWeek(meal)"
                      >
                        {{ 'planning.duplicateNextWeek' | t }}
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

      <!-- Feuille d'ajout de repas -->
      @if (addingDate(); as date) {
        <div class="card flex flex-col gap-3 border-primary">
          <h2 class="font-semibold">{{ 'planning.addMeal' | t }} — {{ date }}</h2>
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
          <div class="flex gap-2">
            <button type="button" class="btn-primary flex-1" (click)="createMeal()">
              {{ 'app.save' | t }}
            </button>
            <button type="button" class="btn-secondary" (click)="addingDate.set(null)">
              {{ 'app.cancel' | t }}
            </button>
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
    const [detail, recipes] = await Promise.all([
      this.householdApi.getDetail(this.householdId),
      this.recipesApi.list(this.householdId),
    ]);
    this.mealTypes.set(detail.household.mealTypes ?? []);
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
  }

  protected async createMeal(): Promise<void> {
    const householdId = this.householdId;
    const date = this.addingDate();
    if (!householdId || !date || !this.newMealTypeId) {
      return;
    }
    await this.planningApi.create(householdId, {
      date,
      mealTypeId: this.newMealTypeId,
      recipes: this.newRecipeId
        ? [{ recipeId: this.newRecipeId, servings: this.newServings }]
        : [],
    });
    this.addingDate.set(null);
    await this.refresh();
  }

  protected async deleteMeal(meal: PlannedMeal): Promise<void> {
    if (!this.householdId) {
      return;
    }
    await this.planningApi.delete(this.householdId, meal.id);
    await this.refresh();
  }

  protected async duplicateNextWeek(meal: PlannedMeal): Promise<void> {
    if (!this.householdId) {
      return;
    }
    const target = toIsoDate(new Date(new Date(meal.date + 'T12:00:00').getTime() + 7 * DAY_MS));
    try {
      await this.planningApi.duplicate(this.householdId, meal.id, target);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.conflict.set(true);
      }
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
  }
}
