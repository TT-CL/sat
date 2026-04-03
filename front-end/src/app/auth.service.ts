import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

interface Identity {
  email: string;
  given_name: string;
  picture: string;
  name: string;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  cachedIdentity: BehaviorSubject<Identity | null>;

  constructor(
    private http: HttpClient,
    private session: SessionStorageService,
    private router: Router,
  ) {
    const anonId = this.session.retrieve('cached_identity') as Identity | null;
    this.cachedIdentity = new BehaviorSubject<Identity | null>(anonId);
  }

  retrieveUserAuthToken() {
    this.retrieveUserIdentity().subscribe(identity => {
      this.cachedIdentity.next(identity);
      this.session.store('cached_identity', identity);
    });
  }

  retrieveUserAuthTokenAndRediect() {
    this.retrieveUserIdentity().subscribe(identity => {
      this.cachedIdentity.next(identity);
      this.session.store('cached_identity', identity);
      if (identity) {
        // this.router.navigate(['/projects']);
      }
    });
  }

  private retrieveUserIdentity(): Observable<Identity | null> {
    const url = '/api/auth/identity';
    return this.http.get<Identity | null>(url, httpOptions);
  }

  getGivenName(): Observable<string | undefined> {
    return this.cachedIdentity.asObservable().pipe(
      map(identity => identity?.given_name)
    );
  }

  getAvatar(): Observable<string | undefined> {
    return this.cachedIdentity.asObservable().pipe(
      map(identity => identity?.picture)
    );
  }

  getName(): Observable<string | undefined> {
    return this.cachedIdentity.asObservable().pipe(
      map(identity => identity?.name)
    );
  }

  getEmail(): Observable<string | undefined> {
    return this.cachedIdentity.asObservable().pipe(
      map(identity => identity?.email)
    );
  }

  isIdentityCached(): Observable<boolean> {
    return this.cachedIdentity.asObservable().pipe(
      map(identity => Boolean(identity))
    );
  }

  async loggedInPromise(): Promise<boolean> {
    const identity = await firstValueFrom(this.retrieveUserIdentity());
    this.session.store('cached_identity', identity);
    this.cachedIdentity.next(identity);
    return Boolean(identity);
  }

  logout() {
    this.cachedIdentity.next(null);
    this.session.clear('cached_identity');

    const url = '/api/auth/logout';
    fetch(url, {
      method: 'GET',
      credentials: 'include'
    }).then(() => console.log('User Logged Out'));
  }
}