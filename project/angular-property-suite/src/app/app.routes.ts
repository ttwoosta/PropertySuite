import { Routes } from '@angular/router';

/**
 * Top-level app routes. The launcher lives at `''`; each suite app lazy-loads
 * its own route tree. Rent Tracker is the first app ported to Angular.
 */
export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/launcher-page.component').then((m) => m.LauncherPageComponent),
  },
  {
    path: 'rent',
    loadChildren: () => import('./features/rent/rent.routes').then((m) => m.RENT_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
