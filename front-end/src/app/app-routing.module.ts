import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentViewerComponent } from './editor/document-viewer/document-viewer.component';

const routes: Routes = [
  { path: 'reader', component: DocumentViewerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
