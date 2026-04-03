import { Component, OnInit, NgZone, AfterViewInit} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthService } from '../../auth.service';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.sass'],
    standalone: true,
    imports: [
    MatCardModule,
    MatButtonModule
]
})
export class LoginPageComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {
  }
  ngOnInit() {
    this.auth.isIdentityCached().pipe(first()).subscribe(loggedIn => {
      if (loggedIn){
        console.log("redirect")
        this.redirectToProjects();
      }
    });
  }

  redirectToProjects() {
    this.router.navigate(['/projects']);
  }

  public googleLogin(){
    window.location.replace(location.origin + "/api/login/google");
    /**
    this.auth.googleLogin().subscribe((res)=>{
      console.log(res);
    });
    **/
  }
}
