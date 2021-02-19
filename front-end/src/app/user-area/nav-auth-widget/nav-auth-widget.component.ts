import { Component, OnInit, NgZone } from '@angular/core';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';

import { filter } from 'rxjs/operators';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-nav-auth-widget',
  templateUrl: './nav-auth-widget.component.html',
  styleUrls: ['./nav-auth-widget.component.sass']
})
export class NavAuthWidgetComponent implements OnInit{

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private oauthService: OAuthService,
    private storage: StorageService,
  ) {
    //listen to router change events to hide the login button when redundant
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.landingArea = event.url == "/" || event.url == "/login";
      //console.log(this.landingArea);
    });
  }

  landingArea:boolean = true;

  redirectToRoot() {
    this.router.navigate(['/']);
  }

  public get userSignedIn() {
      var claims = this.oauthService.getIdentityClaims();
      if (!claims){
        //console.log("user not logged in");
        return false;
      }
      //console.log("user logged in");
      return true;
  }

  public get userAvatar() {
      var claims = this.oauthService.getIdentityClaims();
      if (!claims){
        return null;
      }
      return claims['picture'];
  }

  public get userName() {
      var claims = this.oauthService.getIdentityClaims();
      if (!claims){
        return null;
      }
      return claims['given_name'];
  }

  public logout() {
    //only clearing projects to avoid deleeting some objects that I shouldn't
    //this.storage.clearSession();
    this.storage.clearProjects();
    this.oauthService.logOut();
    this.redirectToRoot();
  }

  ngOnInit() {
  }
}
