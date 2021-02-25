import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IuDisplayComponent } from './editor/iu-display/iu-display.component';
import { DocumentViewerComponent } from './editor/document-viewer/document-viewer.component';

import { MatCardModule } from '@angular/material/card';
import { EditorDashboardComponent } from './editor/editor-dashboard/editor-dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import { NavigationComponent } from './navigation/navigation.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import { DashToolbarComponent } from './editor/dash-toolbar/dash-toolbar.component';
import { SpinnerOverlayComponent } from './editor/spinner-overlay/spinner-overlay.component';
import { OverlayService } from './overlay.service';
import { DynamicOverlay } from './dynamic-overlay/dynamic-overlay.service';
import { DynamicOverlayContainer } from './dynamic-overlay/dynamic-overlay-container.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {OverlayModule} from '@angular/cdk/overlay';
import { ProjectDashComponent } from './user-area/project-dash/project-dash.component';
import { ProjectItemComponent } from './user-area/project-item/project-item.component';
import { NewProjectComponent } from './user-area/new-project/new-project.component';
import { SummaryMinicardComponent } from './user-area/summary-minicard/summary-minicard.component';
import { UploadOverlayComponent } from './user-area/upload-overlay/upload-overlay.component';

import {NgxWebstorageModule} from 'ngx-webstorage';
import { LoginPageComponent } from './user-area/login-page/login-page.component';
import { NavAuthWidgetComponent } from './user-area/nav-auth-widget/nav-auth-widget.component';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthGuardService } from './auth-guard.service';
import { CatchLoginComponent } from './user-area/catch-login/catch-login.component';

import {PortalModule} from '@angular/cdk/portal';
import { SourceReaderComponent } from './editor/source-reader/source-reader.component';
import { SummaryReaderComponent } from './editor/summary-reader/summary-reader.component';
import { SummaryIuComponent } from './editor/summary-iu/summary-iu.component';
import { SourceIuComponent } from './editor/source-iu/source-iu.component';
import { MatSelectModule } from '@angular/material/select';
import { SummaryCardComponent } from './editor/summary-card/summary-card.component';
import { SourceCardComponent } from './editor/source-card/source-card.component';
import { SourceLinkComponent } from './editor/source-link/source-link.component';
import { SummaryLinkComponent } from './editor/summary-link/summary-link.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';


@NgModule({
  declarations: [
    AppComponent,
    IuDisplayComponent,
    DocumentViewerComponent,
    EditorDashboardComponent,
    NavigationComponent,
    DashToolbarComponent,
    SpinnerOverlayComponent,
    ProjectDashComponent,
    ProjectItemComponent,
    NewProjectComponent,
    SummaryMinicardComponent,
    UploadOverlayComponent,
    LoginPageComponent,
    NavAuthWidgetComponent,
    CatchLoginComponent,
    SourceReaderComponent,
    SummaryReaderComponent,
    SummaryIuComponent,
    SourceIuComponent,
    SummaryCardComponent,
    SourceCardComponent,
    SourceLinkComponent,
    SummaryLinkComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
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
    NgxWebstorageModule.forRoot(),
    OAuthModule.forRoot(),
    PortalModule,
    MatSelectModule,
  ],
  providers: [OverlayService, DynamicOverlay, DynamicOverlayContainer, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
