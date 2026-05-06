import { Component, OnInit, NgZone } from '@angular/core';

import { Router, ActivatedRoute, NavigationEnd, RouterModule} from '@angular/router';
import { Observable } from 'rxjs';


import { filter } from 'rxjs/operators';


import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { StorageService } from '../../storage.service';

@Component({
    selector: 'app-nav-auth-widget',
    templateUrl: './nav-auth-widget.component.html',
    styleUrls: ['./nav-auth-widget.component.sass'],
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      MatButtonModule
    ]
})
export class NavAuthWidgetComponent implements OnInit{

  constructor(
    private router: Router,
    private auth: AuthService,
    private storage: StorageService,
  ) {
    //listen to router change events to hide the login button when redundant
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.landingArea = event.url == "/" || event.url == "/login";
      //console.log(this.landingArea);
    });

    auth.isIdentityCached().subscribe(loggedIn =>{
      this.loggedIn = loggedIn;
    })
  }

  public loggedIn :boolean = false;
  public userName$ = this.auth.getGivenName();
  public avatar$ = this.auth.getAvatar();
  landingArea:boolean = true;

  redirectToRoot() {
    this.router.navigate(['/']);
  }

  public logout() {
    this.auth.logout();
    this.storage.clearProjects();
    this.redirectToRoot();
  }

  ngOnInit() {
  }
}
