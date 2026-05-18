import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptors,
  HttpClient
} from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app/app-routing.module';

import { provideNgxWebstorage, withLocalStorage, withSessionStorage } from 'ngx-webstorage';

import { MarkdownModule } from 'ngx-markdown';

import { OverlayService } from './app/overlay.service';
import { DynamicOverlay } from './app/dynamic-overlay/dynamic-overlay.service';
import { DynamicOverlayContainer } from './app/dynamic-overlay/dynamic-overlay-container.service';
import { TelemetryErrorHandlerService } from './app/telemetry-error-handler.service';

// Angular Material / CDK
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
import { firebaseAuthInterceptor } from './app/firebase-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),

    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      AppRoutingModule,

      MatCardModule,
      MatGridListModule,
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      LayoutModule,
      MatToolbarModule,
      MatTabsModule,
      MatChipsModule,
      MatSidenavModule,
      MatListModule,
      MatFormFieldModule,
      MatInputModule,
      OverlayModule,
      MatProgressSpinnerModule,
      PortalModule,
      MatSelectModule,
      MatTooltipModule,

      MarkdownModule.forRoot({
        loader: HttpClient
      })
    ),

    provideHttpClient(
      withInterceptors([
        firebaseAuthInterceptor,
      ])),

    provideAnimations(),

    provideNgxWebstorage(
      withLocalStorage(),
      withSessionStorage()
    ),

    OverlayService,
    DynamicOverlay,
    DynamicOverlayContainer,

    {
      provide: ErrorHandler,
      useClass: TelemetryErrorHandlerService
    }
  ]
};