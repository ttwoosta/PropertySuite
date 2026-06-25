import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.status).pipe(
    filter((s) => s !== 'resolving'),
    take(1),
    map((s) => s === 'in' ? true : router.createUrlTree(['/login'])),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.status).pipe(
    filter((s) => s !== 'resolving'),
    take(1),
    map((s) => s === 'out' ? true : router.createUrlTree(['/'])),
  );
};
