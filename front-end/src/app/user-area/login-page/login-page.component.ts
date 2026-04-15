import { Component, OnInit, NgZone, AfterViewInit} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthService } from '../../auth.service';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { StorageService } from 'src/app/storage.service';

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
    this.storage.exitOfflineMode();
    window.location.replace(location.origin + "/api/login/google");
    /**
    this.auth.googleLogin().subscribe((res)=>{
      console.log(res);
    });
    **/
  }

  public goOffline(){
    this.storage.enterOfflineMode();
    this.redirectToProjects();
  }
}
