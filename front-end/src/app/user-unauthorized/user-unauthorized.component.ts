import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-unauthorized',
  templateUrl: './user-unauthorized.component.html',
  styleUrls: ['./user-unauthorized.component.sass']
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
