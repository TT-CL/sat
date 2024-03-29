import { Injectable } from '@angular/core';
import { IdeaUnit, IUCollection, Project } from './objects/objects.module';

import {BehaviorSubject, Observable} from 'rxjs';

import {SessionStorageService} from 'ngx-webstorage';
import { BackEndService } from './back-end.service';
import { AuthService } from './auth.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

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
  work_similarities_support = {};
  work_similarities: BehaviorSubject<Object>;

  clicked_source_iu_support : IdeaUnit = null;
  clicked_source_iu : BehaviorSubject<IdeaUnit>;
  clicked_summary_iu_support : IdeaUnit = null;
  clicked_summary_iu : BehaviorSubject<IdeaUnit>;

  projects_support : Project[] = [];
  projects : BehaviorSubject<Project []>;

  constructor(
    private session: SessionStorageService,
    private backend: BackEndService,
    private auth: AuthService){
    console.log("Loading projects from session...");
    let anonymous_objects = this.session.retrieve('projects_support');
    
    // initialize the Subject for the observers
    this.projects = new BehaviorSubject<Project[]>(null);
    this.cur_project = new BehaviorSubject<Project>(null);
    this.work_source = new BehaviorSubject<IUCollection>(null);
    this.work_summary = new BehaviorSubject<IUCollection>(null);
    this.clicked_source_iu = new BehaviorSubject<IdeaUnit>(null);
    this.clicked_summary_iu = new BehaviorSubject<IdeaUnit>(null);
    this.work_similarities = new BehaviorSubject<Object>(null);
    auth.loggedInPromise().then(logged =>{
      if (logged){
        // retrieve projects from db
        this.downloadProjects();
      }else{
        this.initSubjects(anonymous_objects);
      }
    })
  }

  downloadProjects(): void {
    this.backend.getProjects().subscribe(
      event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          //console.log('${fName} is ${percentDone}% loaded.');
        } else if (event instanceof HttpResponse) {
          //console.log("ok!")
          this.initSubjects(event.body);
        }
      },
      (err) => {
        console.log("Error downloading projects:", err);
      }, () => {
        //console.log("Work summary updated successfully");
      });
  }

  initSubjects( anonymous_objects){
    //load the projects as a Typescript Project
    if (anonymous_objects) {
      for (let obj of anonymous_objects) {
        let proj = new Project();
        proj.reconsolidate(obj);
        this.projects_support.push(proj);
      }
    }
    console.log(this.projects_support);
    // initialize the Subject for the observers
    this.projects.next(this.projects_support);
    this.cur_project.next(this.cur_project_support);
    this.work_source.next(this.work_source_support);
    this.work_summary.next(this.work_summary_support);
    this.clicked_source_iu.next(this.clicked_source_iu_support);
    this.clicked_summary_iu.next(this.clicked_summary_iu_support);
    this.work_similarities.next(this.work_similarities_support);
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

  updateCurProject(proj: Project, sync: boolean = false){
    //update current project
    this.cur_project_support = proj;
    this.cur_project.next(this.cur_project_support);
    //TODO: upload to server

    if(sync){
      console.log(proj.sourceDoc)
      this.backend.updateSourceSilent(proj.sourceDoc);
      proj.summaryDocs.forEach(summary => {
        this.backend.updateSummarySilent(summary);
      });
    }

    // update full projects in memory
    this.projects_support[this.cur_project_idx] = proj;
    this.projects.next(this.projects_support);
    // update work source
    this.work_source_support = this.cur_project_support.sourceDoc;
    this.work_source.next(this.work_source_support);
    // update work summary
    if(this.cur_project_support.summaryDocs){
      if(this.work_summary_idx &&
         this.work_summary_idx < this.cur_project_support.summaryDocs.length){
        //if the summary index still refers to some work_summary after the update
        //refresh the work structure in case the indexes shifted around
        this.setWorkSummaryIdx(this.work_summary_idx);
      }else if (this.cur_project_support.summaryDocs.length > 0){
        //default 1: if I now have some summaries, set the work index to 0
        this.setWorkSummaryIdx(0);
      }else{
        // I have emptied the summary queue, remove the work summaries
        this.clearWorkSummary();
      }
    }else{
      // I do not have a summary queue, ensure no work summary is set
      this.clearWorkSummary();
    }
    this.saveProjects();
  }

  getCurProject(): Observable <Project>{
    return this.cur_project.asObservable();
  }

  /// CURRENT WORD DOCUMENTS SAVE AREA ///

  setWorkSummaryIdx(idx: number){
    this.clearClickedSummaryIU();


    //set the new work_summary
    this.work_summary_idx = idx;
    this.work_summary_support = this.cur_project_support.summaryDocs[idx];
    this.work_summary.next(this.work_summary_support);
  }

  updateWorkSummary(summary : IUCollection, sync: boolean = false){
    this.work_summary_support = summary;
    this.work_summary.next(this.work_summary_support);
    this.cur_project_support.summaryDocs[this.work_summary_idx] = summary;
    this.cur_project.next(this.cur_project_support);
    //TODO: upload to server
    if (sync){
      this.backend.updateSummarySilent(summary);
    }

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

  /// CURRENT CLICKED IU SAVE AREA ///

  switchClickedSourceIU(iu: IdeaUnit){
    this.clicked_source_iu_support = iu;
    this.clicked_source_iu.next(iu);
  }

  switchClickedSummaryIU(iu: IdeaUnit){
    this.clicked_summary_iu_support = iu;
    this.clicked_summary_iu.next(iu);
  }

  clearClickedSourceIU(){
    this.switchClickedSourceIU(null);
  }

  clearClickedSummaryIU(){
    this.switchClickedSummaryIU(null);
  }

  updateClickedSourceIU(iu: IdeaUnit){
    this.switchClickedSourceIU(iu);
    this.work_source_support.ius[iu.label]=iu;
    this.updateWorkSource(this.work_source_support);
  }

  updateClickedSummaryIU(iu: IdeaUnit){
    this.switchClickedSummaryIU(iu);
    this.work_summary_support.ius[iu.label]=iu;
    this.updateWorkSummary(this.work_summary_support);
  }

  getClickedSourceIU(): Observable<IdeaUnit>{
    return this.clicked_source_iu.asObservable();
  }

  getClickedSummaryIU(): Observable<IdeaUnit>{
    return this.clicked_summary_iu.asObservable();
  }

  /// SIMS ///

  addReceivedSimilarity(simsDoc: Object): void{
    this.work_similarities_support[simsDoc["doc_name"]] = simsDoc["sims"];
    this.work_similarities.next(this.work_similarities_support);
  }

  getSimilarities(): Observable<Object>{
    return this.work_similarities.asObservable();
  }

  clearSimilarities(doc_name: string):void{
    delete this.work_similarities_support[doc_name];
    this.work_similarities.next(this.work_summary_support);
  }

  clearAllSimilarities():void{
    this.work_similarities_support = {};
    this.work_similarities.next(this.work_similarities_support);
  }

  // MULTIPLE UPDATE
  updateStorage(
    cur_proj: Project = null, 
    work_source: IUCollection = null,
    work_summary: IUCollection = null,
    ): void{
      //TODO: implement this maybe?
  }
}
