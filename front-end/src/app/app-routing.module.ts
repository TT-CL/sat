import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProjectDashComponent } from './user-area/project-dash/project-dash.component';
import { NewProjectComponent } from './user-area/new-project/new-project.component';
import { EditorDashboardComponent } from './editor/editor-dashboard/editor-dashboard.component';

import { LoginPageComponent } from './user-area/login-page/login-page.component';
import { CatchLoginComponent } from './user-area/catch-login/catch-login.component';

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
    path: 'editor',
    canActivate: [AuthGuardService],
    children:[
      {
        path: '',
        redirectTo: '/editor/manager',
        pathMatch: 'full'
      },
      {
        path:':view',
        component: EditorDashboardComponent,
      }
    ]
  },
  { path: '', component: LoginPageComponent},
  { path: 'login', component: LoginPageComponent},
  //page called upon receiving the OAuth token from Google
  { path: 'catch-login', component: CatchLoginComponent},
  //{ path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
