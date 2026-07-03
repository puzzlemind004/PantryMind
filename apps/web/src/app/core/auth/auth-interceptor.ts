import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthStore } from './auth-store';

/**
 * Ajoute le token Bearer aux requêtes API et déconnecte proprement
 * sur une réponse 401 (token expiré ou révoqué).
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const token = authStore.token();
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.url.includes('/auth/')
      ) {
        authStore.clearSession();
        void router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    }),
  );
};
