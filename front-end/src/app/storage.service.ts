import { Injectable } from '@angular/core';
import { IUCollection, Project } from './data-objects';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  sourceDoc : IUCollection;
  summaryDoc : IUCollection;
  projects : Project[] = [];

  setSource(source: IUCollection){
    this.sourceDoc = source;
  }

  setSummary(summary: IUCollection){
    this.summaryDoc = summary;
  }

  addProject(project: Project){
    this.projects.push(project);
  }
}
