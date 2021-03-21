import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  constructor(
    private auth: AuthService,
    private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree>{
    
    return this.auth.isIdentityCached().pipe(
      map(loggedIn =>{
        //console.log(`guard value ${loggedIn}`)
        if (loggedIn == false) {
          return this.router.createUrlTree(['/']);
        }else{
          return true;
        }
      })
    );
  }
}
