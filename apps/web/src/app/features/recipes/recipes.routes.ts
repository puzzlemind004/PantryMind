import { Routes } from '@angular/router';

export const recipesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./recipe-list-page').then((m) => m.RecipeListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./recipe-edit-page').then((m) => m.RecipeEditPage),
  },
  {
    path: ':recipeId',
    loadComponent: () => import('./recipe-edit-page').then((m) => m.RecipeEditPage),
  },
];
