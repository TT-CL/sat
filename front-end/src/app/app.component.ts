import { Component } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

import { environment } from 'src/environments/environment';

export const authCodeFlowConfig: AuthConfig = {
    // Url of the Identity Provider
    issuer: 'https://accounts.google.com',

    // Google wants more lax rules
    strictDiscoveryDocumentValidation : false,

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin + '/catch-login',

    // URL of the SPA to redirect the user after silent refresh
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

    // The SPA's id. The SPA is registerd with this id at the auth-server
    // clientId: 'server.code',
    clientId: environment.googleOAuthSecret,

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    //gooogle does not support PKCE yet
    //responseType: 'code',

    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
    scope: 'openid profile email',

    showDebugInformation: true,
  };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent {
  title = 'Summary Evaluator';

  constructor(private oauthService: OAuthService) {
    this.oauthService.setStorage(sessionStorage);
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
