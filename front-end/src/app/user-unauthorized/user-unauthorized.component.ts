import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-user-unauthorized',
    templateUrl: './user-unauthorized.component.html',
    styleUrls: ['./user-unauthorized.component.sass'],
    standalone: true,
    imports: [
    MatCardModule,
    MatButtonModule
]
})
export class UserUnauthorizedComponent {

  constructor(
    private router: Router,
    private auth: AuthService
    ){
      auth.logout();
    }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
