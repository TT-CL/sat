import { Injectable } from '@angular/core';
import { IUCollection, Project } from './data-objects';

import {BehaviorSubject, Observable} from 'rxjs';

import {SessionStorageService} from 'ngx-webstorage';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  sourceDoc : IUCollection;
  summaryDoc : IUCollection;
  projects_support : Project[] = [];
  projects : BehaviorSubject<Project []>;

  constructor(private session: SessionStorageService){
    console.log("Loading projects from session...");
    let anonymous_objects = this.session.retrieve('projects_support');

    //load the projects as a Typescript Project
    if (anonymous_objects){
      for (let obj of anonymous_objects){
        //casting anonymous object as a Project
        //this will create a temporary object with
        //all the correct variables but no methods
        let temp = obj as Project
        //converting strings to dates
        temp.creation_time = new Date(temp.creation_time);
        temp.last_edit = new Date(temp.last_edit);
        //initialize a new project (along with all its methods)
        let proj = new Project();
        //assign the variables of the temp object to the new object
        Object.assign(proj, temp);
        //now I have variables AND methods. Push it into the support structure
        this.projects_support.push(proj);
      }
    }
    console.log(this.projects_support);

    // initialize the Subject for the observers
    this.projects = new BehaviorSubject<Project []>(this.projects_support);
  }

  saveProjects() {
    this.session.store('projects_support', this.projects_support);
  }

  clearSession() {
    this.session.clear();
  }

  clearProjects() {
    this.projects_support = null;
    this.projects.next(null);
    this.session.clear('projects_support');
  }

  setSource(source: IUCollection){
    this.sourceDoc = source;
  }

  setSummary(summary: IUCollection){
    this.summaryDoc = summary;
  }

  addProject(project: Project){
    this.projects_support.push(project);
    //update session
    this.saveProjects();
    //proc observers
    this.projects.next(this.projects_support);
  }

  removeProject(project: Project){
    this.projects_support.unshift(project);
    //update session
    this.saveProjects();
    //proc observers
    this.projects.next(this.projects_support);
  }

  getProjects(): Observable<Project []> {
    return this.projects.asObservable();
  }
}
