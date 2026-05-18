import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { filter, first, skip, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../../auth.service';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class LoginPageComponent implements OnInit {
  constructor(
    private router: Router,
    private auth: AuthService,
    private storage: StorageService
  ) {
  }
ngOnInit(): void {
  this.auth.isAuthReady().pipe(
    filter(ready => ready),
    take(1),
    switchMap(() => this.auth.isIdentityCached()),
    take(1)
  ).subscribe(loggedIn => {
    if (loggedIn) {
      // already logged in (e.g. page refresh), skip the catch-login page
      this.router.navigate(['/projects']);
    } else {
      // not logged in yet — now watch for a fresh login
      this.auth.isIdentityCached().pipe(
        filter(loggedIn => loggedIn),
        take(1)
      ).subscribe(() => {
        this.router.navigate(['/logged-in']);
      });
    }
  });
}
  redirectToProjects() {
    this.router.navigate(['/projects']);
  }

  async googleLogin() {
    this.storage.exitOfflineMode();
    await this.auth.loginWithGoogle();
    /**
    this.auth.googleLogin().subscribe((res)=>{
      console.log(res);
    });
    **/
  }

  async githubLogin() {
    this.storage.exitOfflineMode();
    await this.auth.loginWithGithub();
    /**
    this.auth.googleLogin().subscribe((res)=>{
      console.log(res);
    });
    **/
  }

  public goOffline() {
    this.storage.enterOfflineMode();
    this.redirectToProjects();
  }
}
