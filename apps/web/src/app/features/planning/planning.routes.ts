import { Routes } from '@angular/router';

export const planningRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./planning-page').then((m) => m.PlanningPage),
  },
  {
    path: 'meals/:mealId/validate',
    loadComponent: () => import('./meal-validation-page').then((m) => m.MealValidationPage),
  },
];
