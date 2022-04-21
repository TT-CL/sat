import { Component } from '@angular/core';
import { timer } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '../environments/environment';
import { TelemetryService } from './telemetry.service';
import { ActivatedRouteSnapshot, ResolveEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent {
  title = 'SAT';
  LOG_IN_INTERVAL: number = 5 //interval in minutes

  constructor(
    private auth: AuthService,
    private telemetry: TelemetryService,
    private router: Router) {
    // TELEMETRY
  

    // log route changes
    const routerSubscription = this.router.events
      .pipe(filter(event => event instanceof ResolveEnd))
      .subscribe((event: ResolveEnd) => {
        const activatedComponent = this.getActivatedComponent(event.state.root);
        if (activatedComponent) {
          telemetry.logPageView(`${activatedComponent.name} ${this.getRouteTemplate(event.state.root)}`);
        }
      });

    // autologin
    let ms_interval = this.LOG_IN_INTERVAL * 60 * 1000; //interval in ms

    const stopwatch1 = timer(0)   //at the start
    const stopwatch2 = timer(500);  //after half a second, just in case
    const repeater = timer(ms_interval, ms_interval);

    // Fire the function twice at first to ensure usability
    // Afterwards, refresh the token every LOG_IN_INTERVAL minutes
    stopwatch1.subscribe(() => {
      this.auth.retrieveUserAuthTokenAndRediect()
    });
    stopwatch2.subscribe(() => this.auth.retrieveUserAuthToken());
    repeater.subscribe(time => this.retrieveAuthToken(time));
  }

  retrieveAuthToken(time) {
    console.log(`${time*this.LOG_IN_INTERVAL+1}mins`);
    console.log("retrieve auth token");
    this.auth.retrieveUserAuthToken();
  }

  private getActivatedComponent(snapshot: ActivatedRouteSnapshot): any {

    if (snapshot.firstChild) {
      return this.getActivatedComponent(snapshot.firstChild);
    }

    return snapshot.component;
  }

  private getRouteTemplate(snapshot: ActivatedRouteSnapshot): string {
    let path = '';
    if (snapshot.routeConfig) {
      path += snapshot.routeConfig.path;
    }

    if (snapshot.firstChild) {
      return path + this.getRouteTemplate(snapshot.firstChild);
    }

    return path;
  }
}