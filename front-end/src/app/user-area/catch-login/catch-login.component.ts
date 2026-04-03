
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

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
    auth.retrieveUserAuthToken()
  }

  timer : ReturnType<typeof setTimeout>;
  ngOnInit(): void {
    this.timer = setTimeout(()=>{this.redirectToProjects()}, 3000);
  }

  redirectToProjects() {
    clearTimeout(this.timer);
    this.router.navigate(['/projects']);
  }
}
