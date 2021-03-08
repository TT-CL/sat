import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private oauthService: OAuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

    var idToken = this.oauthService.getIdToken()
    var hasIdToken = this.oauthService.hasValidIdToken();
    var hasAccessToken = this.oauthService.hasValidAccessToken();

    var loggedIn = hasIdToken && hasAccessToken
    if (!loggedIn && idToken != null){
      /**
      this.oauthService.silentRefresh()
      .then(info => console.debug('refresh ok', info))
      .catch(err => console.error('refresh error', err));
    }else if(!loggedIn){
      */
      this.router.navigate(['/'])
    }
    
    /**
    console.log("ID Token")
    console.log(this.oauthService.getIdToken())
    console.log("ID Claims")
    console.log(this.oauthService.getIdentityClaims())
    console.log(`Has ID Token? ${hasIdToken}`)
    console.log(`Has Valid Access Token? ${hasAccessToken}`)
    */
    return loggedIn;
  }
}
