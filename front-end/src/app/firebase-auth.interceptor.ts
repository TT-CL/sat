import { inject } from '@angular/core';
import {
  HttpInterceptorFn
} from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const firebaseAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only attach the bearer token to your backend API calls.
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(authReq);
    })
  );
};