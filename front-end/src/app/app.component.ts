import { Component, OnDestroy } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { ActivatedRouteSnapshot, ResolveEnd, Router } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { TelemetryService } from './telemetry.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  standalone: true,
  imports: [NavigationComponent]
})
export class AppComponent implements OnDestroy {
  title = 'SAT';

  private routerSubscription?: Subscription;

  constructor(
    private telemetry: TelemetryService,
    private router: Router
  ) {
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is ResolveEnd => event instanceof ResolveEnd))
      .subscribe((event: ResolveEnd) => {
        const activatedComponent = this.getActivatedComponent(event.state.root);

        if (activatedComponent) {
          this.telemetry.logPageView(
            `${activatedComponent.name} ${this.getRouteTemplate(event.state.root)}`
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private getActivatedComponent(snapshot: ActivatedRouteSnapshot): any {
    if (snapshot.firstChild) {
      return this.getActivatedComponent(snapshot.firstChild);
    }

    return snapshot.component;
  }

  private getRouteTemplate(snapshot: ActivatedRouteSnapshot): string {
    let path = '';

    if (snapshot.routeConfig?.path) {
      path += snapshot.routeConfig.path;
    }

    if (snapshot.firstChild) {
      const childPath = this.getRouteTemplate(snapshot.firstChild);
      return childPath ? `${path}/${childPath}` : path;
    }

    return path;
  }
}