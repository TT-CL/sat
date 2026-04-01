import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProjectDashComponent } from './user-area/project-dash/project-dash.component';
import { NewProjectComponent } from './user-area/new-project/new-project.component';
import { EditorDashboardComponent } from './editor/editor-dashboard/editor-dashboard.component';

import { LoginPageComponent } from './user-area/login-page/login-page.component';
import { CatchLoginComponent } from './user-area/catch-login/catch-login.component';
import { UserUnauthorizedComponent } from './user-unauthorized/user-unauthorized.component';

import { AuthGuardService } from './auth-guard.service';
import { GuideComponent } from './guide/guide.component';

const routes: Routes = [
  { path: '', component: LoginPageComponent, title: 'Login Page Component'},
  { path: 'unauthorized', component: UserUnauthorizedComponent , title: 'Unauthorized'},
  { path: 'login', component: LoginPageComponent , title: 'Login'},
  //page called upon receiving the OAuth token from Google
  { path: 'logged-in', component: CatchLoginComponent , title: 'Login successful'},
  //{ path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'guide', component: GuideComponent , title: 'Guide'},
  {
    path: 'projects',
    component: ProjectDashComponent,
    canActivate: [AuthGuardService],
    title: 'Projects'
  },
  {
    path: 'projects/new-project',
    component: NewProjectComponent,
    canActivate: [AuthGuardService],
    title: 'New Project'
  },
  {
    path: 'editor',
    canActivate: [AuthGuardService],
    title: 'Editor',
    children:[
      {
        path: '',
        redirectTo: '/editor/reader',
        pathMatch: 'full',
        title: 'Reader'
      },
      {
        path:':view',
        component: EditorDashboardComponent,
        title: 'View'
      }
    ]
  },
  { path: '**', component: PageNotFoundComponent , title: '404'},
];

const routerConfig : ExtraOptions = {
  canceledNavigationResolution: "replace",
  paramsInheritanceStrategy: 'always',
  urlUpdateStrategy: 'eager',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerConfig)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
