import { Component, OnInit, NgZone} from '@angular/core';

import { OAuthService } from 'angular-oauth2-oidc';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private oauthService: OAuthService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    var claims = this.oauthService.getIdentityClaims();
    if (claims){
      this.redirectToProjects();
    }
  }

  redirectToProjects() {
    this.router.navigate(['/projects']);
  }

  public login(){
    this.oauthService.initLoginFlow();
  }
}
