import { Component, OnInit, NgZone } from '@angular/core';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';


import { filter } from 'rxjs/operators';


import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-nav-auth-widget',
  templateUrl: './nav-auth-widget.component.html',
  styleUrls: ['./nav-auth-widget.component.sass']
})
export class NavAuthWidgetComponent implements OnInit{

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    //listen to router change events to hide the login button when redundant
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.landingArea = event.url == "/" || event.url == "/login";
      //console.log(this.landingArea);
    });
    auth.retrieveUserIdentity().subscribe(id =>{
      this.identity = id;
    })
  }

  landingArea:boolean = true;
  
  identity: boolean | Object;

  redirectToRoot() {
    this.router.navigate(['/']);
  }

  public get userSignedIn() {
    return Boolean(this.identity);
  }

  userName$ = this.auth.getGivenName();
  avatar$ = this.auth.getAvatar();

  public logout() {
    this.auth.logout();
  }

  ngOnInit() {
  }
}
