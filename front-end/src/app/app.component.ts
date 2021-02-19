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
    /**
    // URL of the SPA to redirect the user to after login
    this.oauthService.redirectUri = window.location.origin + "/catch-login";

    // The SPA's id. The SPA is registerd with this id at the auth-server
    this.oauthService.clientId = environment.googleOAuthSecret;


    // set the scope for the permissions the client should request
    // The first three are defined by OIDC. The 4th is a usecase-specific one
    this.oauthService.scope = "openid profile email";

    // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
    // OAuth2-based access_token
    this.oauthService.oidc = true; // ID_Token

    // set oauth issuer
    this.oauthService.issuer = "https://accounts.google.com";

    this.oauthService.strictDiscoveryDocumentValidation = false;


    // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
    // instead of localStorage
    this.oauthService.setStorage(sessionStorage);

    // Discovery Document of your AuthServer as defined by OIDC
    let url = 'https://accounts.google.com/.well-known/openid-configuration';

    // Load Discovery Document and then try to login the user
    this.oauthService.loadDiscoveryDocument(url).then(() => {

      // This method just tries to parse the token(s) within the url when
      // the auth-server redirects the user back to the web-app
      // It dosn't send the user the the login page
      this.oauthService.tryLogin({});

      /**
      also try this.oauthService.loadDiscoveryDocumentAndTryLogin();
      //enable this once we have a token validator in the python server

      this.oauthService.tryLogin({
        validationHandler: context => {
            var search = new URLSearchParams();
            search.set('token', context.idToken);
            search.set('client_id', oauthService.clientId);
            return http.get(validationUrl, { search }).toPromise();
        }
      });
      **

    });
    **/
    this.oauthService.setStorage(sessionStorage);
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
}
