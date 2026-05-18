import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  offlineMode!: boolean;

  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: StorageService
  ) {
    this.storage.getOfflineMode().subscribe({
      next: (offlineMode: boolean) => this.offlineMode = offlineMode
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return combineLatest([
      this.auth.isAuthReady(),
      this.auth.isIdentityCached()
    ]).pipe(
      filter(([ready]) => ready),
      take(1),
      map(([, loggedIn]) => {
        if (loggedIn || this.offlineMode) {
          return true;
        }

        if (!this.offlineMode) {
          this.storage.enterOfflineMode();
        }

        return this.router.createUrlTree(['/']);
      })
    );
  }
}