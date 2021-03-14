import { Component, OnInit, NgZone, AfterViewInit} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {
  }
  ngOnInit() {
    this.auth.loggedInPromise().then(loggedIn => {
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
