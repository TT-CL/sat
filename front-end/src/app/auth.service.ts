import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck, map, last } from 'rxjs/operators';
import { StorageService } from './storage.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
  observe: 'body'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
   }

  // USER AUTH //

  retrieveUserIdentity(): Observable<HttpEvent<any>> {
    let url = "/api/auth/identity";

    const req = new HttpRequest('GET', url, httpOptions);

    return this.http.request(req).pipe(pluck('body'));
  }

  getGivenName(): Observable<string>{
    return this.retrieveUserIdentity().pipe(pluck('given_name'));
  }

  getAvatar(): Observable<string> {
    return this.retrieveUserIdentity().pipe(pluck('picture'));
  }
  
  getName(): Observable<string>{
    return this.retrieveUserIdentity().pipe(pluck('name'));
  }

  getEmail(): Observable<string> {
    return this.retrieveUserIdentity().pipe(pluck('email'));
  }

  loggedInPromise(): Promise<boolean>{
    return this.retrieveUserIdentity(     //retrieve the identity observable
    ).pipe(                               //pipe some operators
      last(),                            //limit to only one result
      map(id => { return Boolean(id) })   //cast to boolean
    ).toPromise();                        //cast to promise
  }

  logout() {
    //only clearing projects to avoid deleeting some objects that I shouldn't
    //this.storage.clearSession();
    this.storage.clearProjects();
    //redirect to api server for logging out
    window.location.replace(location.origin + "/api/auth/logout");
  }
}
