import { enableProdMode, ErrorHandler, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { OverlayService } from './app/overlay.service';
import { DynamicOverlay } from './app/dynamic-overlay/dynamic-overlay.service';
import { DynamicOverlayContainer } from './app/dynamic-overlay/dynamic-overlay-container.service';
import { provideNgxWebstorage, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { TelemetryErrorHandlerService } from './app/telemetry-error-handler.service';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortalModule } from '@angular/cdk/portal';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkdownModule } from 'ngx-markdown';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule, MatCardModule, MatGridListModule, MatMenuModule, MatIconModule, MatButtonModule, LayoutModule, MatToolbarModule, MatTabsModule, MatChipsModule, MatSidenavModule, MatListModule, MatFormFieldModule, MatInputModule, OverlayModule, MatProgressSpinnerModule, PortalModule, MatSelectModule, MatTooltipModule, MarkdownModule.forRoot({ loader: HttpClient })),
        OverlayService,
        DynamicOverlay,
        DynamicOverlayContainer,
        provideNgxWebstorage(withLocalStorage(), withSessionStorage()),
        {
            provide: ErrorHandler,
            useClass: TelemetryErrorHandlerService
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
