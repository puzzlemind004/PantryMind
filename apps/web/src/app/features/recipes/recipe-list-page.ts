import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { HouseholdStore } from '../../core/household/household-store';
import { TranslatePipe } from '../../shared/i18n/translate';
import { RecipesApi } from './recipes-api';
import type { Recipe } from '../../core/api/types';

/** Liste des recettes avec recherche et filtre par tag (spec §8.7). */
@Component({
  selector: 'app-recipe-list-page',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-lg flex-col gap-3 p-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ 'recipes.title' | t }}</h1>
        <a routerLink="/recipes/new" class="btn-primary !w-auto px-4 py-2 text-sm">
          + {{ 'recipes.add' | t }}
        </a>
      </header>

      <input
        class="input"
        type="search"
        name="search"
        [placeholder]="'recipes.searchPlaceholder' | t"
        [ngModel]="search()"
        (ngModelChange)="onSearch($event)"
      />

      @if (allTags().length > 0) {
        <div class="flex flex-wrap gap-2">
          @for (tag of allTags(); track tag) {
            <button
              type="button"
              class="rounded-full border border-line px-3 py-1 text-sm"
              [class.!border-primary]="activeTag() === tag"
              [class.text-primary]="activeTag() === tag"
              (click)="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          }
        </div>
      }

      @if (recipes(); as list) {
        @if (list.length === 0) {
          <p class="py-12 text-center text-muted">{{ 'recipes.empty' | t }}</p>
        } @else {
          <ul class="flex flex-col gap-2">
            @for (recipe of list; track recipe.id) {
              <li>
                <a
                  [routerLink]="['/recipes', recipe.id]"
                  class="card flex items-center gap-3 !p-3 transition-colors hover:border-primary"
                >
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium">{{ recipe.name }}</p>
                    <p class="mt-0.5 flex flex-wrap gap-2 text-sm text-muted">
                      <span>{{ 'recipes.servings' | t: { count: recipe.servings } }}</span>
                      @if (totalMinutes(recipe); as minutes) {
                        <span>{{ 'recipes.minutes' | t: { count: minutes } }}</span>
                      }
                      @for (tag of recipe.tags.slice(0, 3); track tag) {
                        <span class="rounded-full bg-surface px-2 py-0.5 text-xs">{{ tag }}</span>
                      }
                    </p>
                  </div>
                  <svg class="h-5 w-5 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </a>
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
export class RecipeListPage implements OnInit {
  private readonly householdStore = inject(HouseholdStore);
  private readonly recipesApi = inject(RecipesApi);

  protected readonly recipes = signal<Recipe[] | null>(null);
  protected readonly search = signal('');
  protected readonly activeTag = signal<string | null>(null);
  protected readonly allTags = signal<string[]>([]);

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

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

  protected toggleTag(tag: string): void {
    this.activeTag.set(this.activeTag() === tag ? null : tag);
    void this.refresh();
  }

  protected totalMinutes(recipe: Recipe): number | null {
    const total = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
    return total > 0 ? total : null;
  }

  private async refresh(): Promise<void> {
    const householdId = this.householdStore.currentHousehold()?.id;
    if (!householdId) {
      return;
    }
    const recipes = await this.recipesApi.list(householdId, {
      search: this.search() || undefined,
      tag: this.activeTag() ?? undefined,
    });
    this.recipes.set(recipes);

    /** Tag cloud built from the unfiltered list on first load. */
    if (this.allTags().length === 0 && !this.search() && !this.activeTag()) {
      this.allTags.set([...new Set(recipes.flatMap((recipe) => recipe.tags))].sort());
    }
  }
}
