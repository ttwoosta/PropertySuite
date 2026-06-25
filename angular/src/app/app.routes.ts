import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('./features/launcher/launcher.component').then((m) => m.LauncherComponent),
    canActivate: [authGuard],
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./features/maintenance/maintenance-app.component').then((m) => m.MaintenanceAppComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rent',
    loadComponent: () => import('./features/rent/rent-app.component').then((m) => m.RentAppComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tenant-bridge',
    loadComponent: () => import('./features/tenant/tenant-app.component').then((m) => m.TenantAppComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile-app.component').then((m) => m.ProfileAppComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
