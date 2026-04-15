import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { NavAuthWidgetComponent } from '../user-area/nav-auth-widget/nav-auth-widget.component'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.sass'],
    standalone: true,
    imports: [
    RouterModule,
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NavAuthWidgetComponent,
    MatChipsModule
]
})
export class NavigationComponent{

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  loggedIn$ : Observable<boolean>;
  offlineMode$ : Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private auth: AuthService,
    private storage: StorageService,
  ) {
    this.loggedIn$ = this.auth.isIdentityCached();
    this.offlineMode$ = this.storage.getOfflineMode();
  }

  homeLink$: Observable<string[]> = this.storage.getOfflineMode().pipe(
  map(offline => offline ? ['/projects'] : ['/'])
);
}
