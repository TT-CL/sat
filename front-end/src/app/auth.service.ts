import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, map, last } from 'rxjs/operators';
import { StorageService } from './storage.service';

interface Identity {
  email: string;
  given_name: string;
  picture: string;
  name: string;
}

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

  cachedIdentity: BehaviorSubject<Identity | Boolean>;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private session: SessionStorageService,
    private router: Router,
  ) {
    let anon_id: Identity = null;
    anon_id = this.session.retrieve('cached_identity');
    this.cachedIdentity = new BehaviorSubject(anon_id);
  }

  redirectToRoot() {
    this.router.navigate(['/']);
  }

  // USER AUTH //

  retrieveUserAuthToken(){
    this.retrieveUserIdentity().subscribe(id=>{
      let identity = id as unknown as Identity;
      this.cachedIdentity.next(identity);
      this.session.store('cached_identity', identity);
    });
  }
  retrieveUserAuthTokenAndRediect() {
    this.retrieveUserIdentity().subscribe(id => {
      let identity = id as unknown as Identity;
      this.cachedIdentity.next(identity);
      this.session.store('cached_identity', identity);
      if (identity != null){
        this.router.navigate(['/projects']);
      }
    });
  }

  private retrieveUserIdentity(): Observable<HttpEvent<any>> {
    let url = "/api/auth/identity";

    const req = new HttpRequest('GET', url, httpOptions);

    return this.http.request(req).pipe(pluck('body'));
  }

  getGivenName(): Observable<string>{
    return this.cachedIdentity.asObservable().pipe(pluck('given_name'));
  }

  getAvatar(): Observable<string> {
    return this.cachedIdentity.asObservable().pipe(pluck('picture'));
  }
  
  getName(): Observable<string>{
    return this.cachedIdentity.asObservable().pipe(pluck('name'));
  }

  getEmail(): Observable<string> {
    return this.cachedIdentity.asObservable().pipe(pluck('email'));
  }

  isIdentityCached(): Observable<boolean>{
    return this.cachedIdentity.asObservable().pipe(map(id=>{
      return Boolean(id);
    }))
  }

  loggedInPromise(): Promise<boolean>{
    return this.retrieveUserIdentity(     //retrieve the identity observable
    ).pipe(                               //pipe some operators
      last(),                            //limit to only one result
      map(id => { 
        //cache identity
        this.session.store('cached_identity', id);
        this.cachedIdentity.next(id as unknown as Identity);
        //cast to boolean
        return Boolean(id);
      })
    ).toPromise();                        //cast to promise
  }

  logout() {
    //only clearing projects to avoid deleeting some objects that I shouldn't
    //this.storage.clearSession();
    this.storage.clearProjects();
    this.cachedIdentity.next(null);
    this.session.clear('cached_identity')

    //call api server to log out user
    let url = "/api/auth/logout";
    fetch(url, {
      method: 'GET',
      credentials: 'include'
    }).then(()=> console.log("User Logged Out"));
    //redirect
    this.redirectToRoot();
  }
}
