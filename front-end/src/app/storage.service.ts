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

  cur_project_idx : number = null;
  cur_project_support : Project = null;
  cur_project : BehaviorSubject<Project>;

  work_summary_idx : number = null;
  work_summary_support : IUCollection = null;
  work_summary : BehaviorSubject<IUCollection>;
  work_source_support : IUCollection = null;
  work_source : BehaviorSubject<IUCollection>;


  projects_support : Project[] = [];
  projects : BehaviorSubject<Project []>;

  constructor(private session: SessionStorageService){
    console.log("Loading projects from session...");
    let anonymous_objects = this.session.retrieve('projects_support');

    //load the projects as a Typescript Project
    if (anonymous_objects){
      for (let obj of anonymous_objects){
        let proj = new Project();
        proj.reconsolidate(obj);
        this.projects_support.push(proj);
      }
    }
    console.log(this.projects_support);

    // initialize the Subject for the observers
    this.projects = new BehaviorSubject<Project []>(this.projects_support);
    this.cur_project = new BehaviorSubject<Project>(this.cur_project_support);
    this.work_source = new BehaviorSubject<IUCollection>(this.work_source_support);
    this.work_summary = new BehaviorSubject<IUCollection>(this.work_summary_support);
  }

  /// ALL PROJECTS SAVE AREA ///

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
    //Upload to db
    //TODO
    //update session
    this.saveProjects();
    //proc observers
    this.projects.next(this.projects_support);
  }

  removeProject(project: Project){
    this.projects_support.unshift(project);
    //Update database
    //TODO
    //update session
    this.saveProjects();
    //proc observers
    this.projects.next(this.projects_support);
  }

  getProjects(): Observable<Project []> {
    return this.projects.asObservable();
  }

  /// CURRENT PROJECT SAVE AREA ///

  setCurProjIndex(idx: number){
    this.cur_project_idx = idx;
    this.initCurProject(idx);
  }


  initCurProject(idx: number){
    this.cur_project_support = this.projects_support[idx];
    this.cur_project.next(this.cur_project_support);

    //init work source
    this.work_source_support = this.cur_project_support.sourceDoc;
    this.work_source.next(this.work_source_support);
    // init work summary
    if (this.cur_project_support.hasSummaries()){
      this.setWorkSummaryIdx(0);
    }
  }

  clearCurProject(){
    this.cur_project_support = null;
    this.cur_project_idx = null;
    this.cur_project.next(this.cur_project_support);
  }

  updateCurProject(proj: Project){
    //update current project
    this.cur_project_support = proj;
    this.cur_project.next(this.cur_project_support);
    //TODO: upload to server

    // update full projects in memory
    this.projects_support[this.cur_project_idx] = proj;
    this.projects.next(this.projects_support);
    this.saveProjects();
  }

  getCurProject(): Observable <Project>{
    return this.cur_project.asObservable();
  }

  /// CURRENT WORD DOCUMENTS SAVE AREA ///

  setWorkSummaryIdx(idx: number){
    this.work_summary_idx = idx;
    this.work_summary_support = this.cur_project_support.summaryDocs[idx];
    this.work_summary.next(this.work_summary_support);
  }

  updateWorkSummary(summary : IUCollection){
    this.work_summary_support = summary;
    this.work_summary.next(this.work_source_support);
    this.cur_project_support.summaryDocs[this.work_summary_idx] = summary;
    this.cur_project.next(this.cur_project_support);
    //TODO: upload to server

    // update full projects in memory
    this.projects_support[this.cur_project_idx] = this.cur_project_support;
    this.projects.next(this.projects_support);
    this.saveProjects();
  }

  updateWorkSource(source : IUCollection){
    this.work_source_support = source;
    this.work_source.next(this.work_source_support);
    this.cur_project_support.sourceDoc = source;
    this.cur_project.next(this.cur_project_support);
    //TODO: upload to server

    // update full projects in memory
    this.projects_support[this.cur_project_idx] = this.cur_project_support;
    this.projects.next(this.projects_support);
    this.saveProjects();
  }

  clearWorkSummary(){
    this.work_summary_idx = null;
    this.work_summary_support = null;
    this.work_summary.next(this.work_summary_support);
  }

  clearWorkSource(){
    this.work_source_support = null;
    this.work_source.next(this.work_source_support);
  }

  getWorkSummary(): Observable <IUCollection>{
    return this.work_summary.asObservable();
  }

  getWorkSource(): Observable <IUCollection>{
    return this.work_source.asObservable();
  }
}
