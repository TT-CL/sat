import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IuDisplayComponent } from './iu-display/iu-display.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { TopbarComponent } from './topbar/topbar.component';

import { MatCardModule } from '@angular/material/card';
import { EditorDashboardComponent } from './editor-dashboard/editor-dashboard.component';
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
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import { DashToolbarComponent } from './dash-toolbar/dash-toolbar.component';
import { LoadOverlayComponent } from './load-overlay/load-overlay.component';
import { ProgressSpinnerService } from './progress-spinner.service';
import { DynamicOverlay } from './load-overlay/dynamic-overlay.service';
import { DynamicOverlayContainer } from './load-overlay/dynamic-overlay-container.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {OverlayModule} from '@angular/cdk/overlay';





@NgModule({
  declarations: [
    AppComponent,
    IuDisplayComponent,
    DocumentViewerComponent,
    TopbarComponent,
    EditorDashboardComponent,
    NavigationComponent,
    FileUploaderComponent,
    DashToolbarComponent,
    LoadOverlayComponent
  ],
  imports: [
    BrowserModule,
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
    MatProgressSpinnerModule
  ],
  providers: [ProgressSpinnerService, DynamicOverlay, DynamicOverlayContainer],
  bootstrap: [AppComponent]
})
export class AppModule { }
