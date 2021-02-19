import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewerComponent } from './editor/document-viewer/document-viewer.component';
import { ProjectDashComponent } from './user-area/project-dash/project-dash.component';
import { NewProjectComponent } from './user-area/new-project/new-project.component';
import { EditorDashboardComponent } from './editor/editor-dashboard/editor-dashboard.component';

import { LoginPageComponent } from './user-area/login-page/login-page.component';
import { CatchLoginComponent } from './user-area/catch-login/catch-login.component';

import { OAuthService } from 'angular-oauth2-oidc';
import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
  {
    path: 'projects',
    component: ProjectDashComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'projects/new-project',
    component: NewProjectComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'editor/:project_index',
    component: EditorDashboardComponent,
    canActivate: [AuthGuardService],
  },
  { path: '', component: LoginPageComponent},
  { path: 'login', component: LoginPageComponent},
  //page called upon receiving the OAuth token from Google
  { path: 'catch-login', component: CatchLoginComponent},
  //{ path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
