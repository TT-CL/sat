import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { last, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private auth: AuthService,
    private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<Boolean> {
    
    return this.auth.isIdentityCached().pipe(
      map(loggedIn =>{
        console.log(`guard value ${loggedIn}`)
        if (loggedIn == false) {
          console.log(loggedIn);
          this.router.navigate(['/']);
        }
        return loggedIn
      })
    );
  }
}
