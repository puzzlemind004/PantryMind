import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/guards';
import { householdGuard, onboardingGuard } from './core/household/household-guards';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup-page').then((m) => m.SignupPage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: 'onboarding',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./features/household/onboarding-page').then((m) => m.OnboardingPage),
  },
  {
    path: '',
    canActivate: [authGuard, householdGuard],
    loadComponent: () => import('./features/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'stock',
        loadChildren: () => import('./features/stock/stock.routes').then((m) => m.stockRoutes),
      },
      {
        path: 'planning',
        loadChildren: () =>
          import('./features/planning/planning.routes').then((m) => m.planningRoutes),
      },
      {
        path: 'recipes',
        loadChildren: () =>
          import('./features/recipes/recipes.routes').then((m) => m.recipesRoutes),
      },
      {
        path: 'shopping',
        loadComponent: () =>
          import('./features/shopping/shopping-page').then((m) => m.ShoppingPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/household/profile-page').then((m) => m.ProfilePage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'stock' },
    ],
  },
  { path: '**', redirectTo: '' },
];
