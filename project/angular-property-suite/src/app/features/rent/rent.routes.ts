import { Routes } from '@angular/router';
import { RentAppComponent } from './rent-app.component';

/**
 * Rent Tracker feature routes. `RentAppComponent` is the layout shell; each
 * view lazy-loads via `loadComponent` so it's only fetched when navigated to.
 */
export const RENT_ROUTES: Routes = [
  {
    path: '',
    component: RentAppComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'grid',
        loadComponent: () => import('./year-grid.component').then((m) => m.YearGridComponent),
      },
      {
        path: 'houses',
        loadComponent: () => import('./houses.component').then((m) => m.HousesComponent),
      },
      {
        path: 'expenses',
        loadComponent: () => import('./expenses.component').then((m) => m.ExpensesComponent),
      },
      {
        path: 'receipts',
        loadComponent: () => import('./receipts.component').then((m) => m.ReceiptsComponent),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
