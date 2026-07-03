import { Routes } from '@angular/router';

export const stockRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock-page').then((m) => m.StockPage),
  },
  {
    path: 'add',
    loadComponent: () => import('./add-stock-page').then((m) => m.AddStockPage),
  },
];
