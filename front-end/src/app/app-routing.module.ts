import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewerComponent } from './editor/document-viewer/document-viewer.component';
import { ProjectDashComponent } from './user-area/project-dash/project-dash.component';
import { NewProjectComponent } from './user-area/new-project/new-project.component';

const routes: Routes = [
  { path: 'projects/new-project', component: NewProjectComponent},
  { path: 'projects', component: ProjectDashComponent},
  { path: '', redirectTo: '/projects', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
