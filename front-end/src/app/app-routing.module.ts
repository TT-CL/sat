import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewerComponent } from './editor/document-viewer/document-viewer.component';
import { ProjectDashComponent } from './user-area/project-dash/project-dash.component';
import { NewProjectComponent } from './user-area/new-project/new-project.component';
import { EditorDashboardComponent } from './editor/editor-dashboard/editor-dashboard.component';

import { LandingPageComponent } from './user-area/landing-page/landing-page.component';

const routes: Routes = [
  { path: 'projects/new-project', component: NewProjectComponent},
  { path: 'projects', component: ProjectDashComponent},
  { path: 'editor/:project_index', component: EditorDashboardComponent},
  { path: '', component: LandingPageComponent},
  //{ path: '', redirectTo: '/projects', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
