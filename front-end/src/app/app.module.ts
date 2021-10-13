import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IuDisplayComponent } from './editor/iu-display/iu-display.component';

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
import { ProjectManagerComponent } from './editor/project-manager/project-manager.component';
import { ProjectDownloaderComponent } from './editor/project-downloader/project-downloader.component';
import { SourceEditorComponent } from './editor/source-editor/source-editor.component';
import { SummaryEditorComponent } from './editor/summary-editor/summary-editor.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContenteditableModule } from '@ng-stack/contenteditable';
import { UserUnauthorizedComponent } from './user-unauthorized/user-unauthorized.component';
import { TelemetryErrorHandlerService } from './telemetry-error-handler.service';
import { GuideComponent } from './guide/guide.component';
import { MarkdownModule } from 'ngx-markdown';


@NgModule({
  declarations: [
    AppComponent,
    IuDisplayComponent,
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
    PageNotFoundComponent,
    ProjectManagerComponent,
    ProjectDownloaderComponent,
    SourceEditorComponent,
    SummaryEditorComponent,
    UserUnauthorizedComponent,
    GuideComponent,
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
    PortalModule,
    MatSelectModule,
    MatTooltipModule,
    ContenteditableModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [
    OverlayService, 
    DynamicOverlay, 
    DynamicOverlayContainer, 
    {
      provide: ErrorHandler,
      useClass: TelemetryErrorHandlerService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
