import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  offlineMode! : boolean
  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: StorageService) {
      storage.getOfflineMode().subscribe({
        next: (offlineMode: boolean) => this.offlineMode = offlineMode
      })
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree>{
    
    return this.auth.isIdentityCached().pipe(
      map(loggedIn =>{
        //console.log(`guard value ${loggedIn}`)
        if (loggedIn || this.offlineMode) {
          return true;
        } else {
          // ensure that offline mode is enabled if I am not logged in
          if (!this.offlineMode){
            this.storage.enterOfflineMode();
          }
          return this.router.createUrlTree(['/']);
        }
      })
    );
  }
}
