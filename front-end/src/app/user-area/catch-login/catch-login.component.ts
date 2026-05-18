import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { combineLatest, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-catch-login',
  templateUrl: './catch-login.component.html',
  styleUrls: ['./catch-login.component.sass'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule
  ]
})
export class CatchLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private auth: AuthService,
  ) {

  }

  public redirectToProjects(): void {
    this.router.navigateByUrl('/projects');
  }

  ngOnInit(): void {
    combineLatest([
      this.auth.isAuthReady(),
      this.auth.isIdentityCached()
    ])
      .pipe(
        filter(([ready]) => ready),
        take(1)
      )
      .subscribe(([, loggedIn]) => {
        if (loggedIn) {
          setTimeout(() => this.redirectToProjects(), 3000);
        } else {
          this.router.navigateByUrl('/');
        }
      });
  }
}