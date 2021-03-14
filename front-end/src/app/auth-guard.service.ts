import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    state: RouterStateSnapshot): Promise<Boolean> {
    
    return this.auth.loggedInPromise().then(loggedIn =>{
      if (!loggedIn) {
        console.log(loggedIn);
        this.router.navigate(['/']);
      }
      return loggedIn
    });
  }
}
