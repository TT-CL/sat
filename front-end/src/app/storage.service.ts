import { Injectable } from '@angular/core';
import { IdeaUnit, IUCollection, Project } from './objects/objects.module';

import { BehaviorSubject, throwError, of, Observable, forkJoin, switchMap } from 'rxjs';
import { catchError, tap, filter, map } from 'rxjs';

import { SessionStorageService } from 'ngx-webstorage';
import { BackEndService } from './back-end.service';
import { AuthService } from './auth.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  offlineMode : boolean;

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
        this.offlineMode = false;
        // retrieve projects from db
        this.downloadProjects();
        
      }else{
        this.offlineMode = true;
        this.initSubjects(anonymous_objects);
      }
    })
  }

  downloadProjects(): void{
    this.backend.getProjects().subscribe({
      next: event => {
        if (event.type === HttpEventType.DownloadProgress && event.total) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          console.log(`Download is ${percentDone}% loaded.`);
        }
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<any>;
          console.log("Projects downloaded successfully!");
          this.initSubjects(response.body);
        }
      },
      error: err => {
        console.error("Error downloading projects:", err);
      },
      complete: () => {
        console.log("Download request complete");
      }
    });
  }

  initSubjects(anonymous_objects){
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
  
  __addProject(project: Project){
    //update session
    this.projects_support.push(project);
    this.saveProjects();
    //proc observers
    this.projects.next(this.projects_support);
  }

  addProject(project: Project): Observable<void>{
    if( this.offlineMode ){
      this.addProject(project)
      return of(void 0);
    }

    //Update database    
    return this.backend.createProject(project).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        //console.log('${fName} is ${percentDone}% loaded.');
        }
      }),
      tap( event =>{
        if (event.type === HttpEventType.Response) {
        console.log(project.name + " added successfully to the database");
        //create new project structure to obtain db only objects (id, date, etc..)
        let db_proj = new Project();
        db_proj.reconsolidate(event.body);
        //add the db project to the current sesstion
        this.__addProject(db_proj)
        }
      }),
      map(() => void 0),
      catchError(err => {
        console.log("Error adding project " + project.name + " to database :", err);
        return throwError(() => err)
      })
    );
  }

  __removeProject(project: Project){
    //update session
    this.projects_support = this.projects_support.filter(p => p._id !== project._id);
    this.saveProjects();
    this.projects.next(this.projects_support);
  }

  removeProject(project: Project): Observable<void>{
    if( this.offlineMode ){
      this.__removeProject(project)
      return of(void 0);
    }

    //Update database    
    return this.backend.deleteProject(project).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        //console.log('${fName} is ${percentDone}% loaded.');
        }
      }),
      tap( event =>{
        if (event.type === HttpEventType.Response) {
        console.log(project.name + " deleted successfully from the database");
        this.__removeProject(project)
        }
      }),
      map(() => void 0),
      catchError(err => {
        console.log("Error deleting project " + project.name + " from database :", err);
        return throwError(() => err)
      })
    );
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

  __updateCurProject(proj: Project){
    //update current project
    this.cur_project_support = proj;
    this.cur_project.next(this.cur_project_support);

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
  __updateDBSource(source: IUCollection, silent: boolean): Observable<HttpEvent<any>> {
    return this.backend.updateSource(source, silent).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          if (!silent) {
            console.log(`Source file update is ${percentDone}% complete.`);
          }
        } else if (event.type === HttpEventType.Response) {
          if (!silent) {
            console.log('Source updated successfully.');
          }
        }
      })
    );
  }

  updateSource(source:IUCollection): Observable<IUCollection> {
    // Updates the source on the db then returns the new document to be later stored in session
    if(this.offlineMode){
      let doc = new IUCollection()
      doc.reconsolidate(source)
      return of(doc)
    }
    return this.__updateDBSource(source, false).pipe(
      filter((event): event is HttpResponse<any> => event.type === HttpEventType.Response),
      map((event: HttpResponse<any> ) => {
        //console.log("update_db_source")
        //console.log(event.body)
        let doc = new IUCollection()
        doc.reconsolidate(event.body);
        //console.log(doc)
        return doc;
      })
    );
  }

  createSummary(summary:IUCollection, project_id:string, silent: boolean): Observable<IUCollection> {
    // Creates the summary on the db then returns the new document to be later stored in session
    if(this.offlineMode){
      let doc = new IUCollection()
      doc.reconsolidate(summary)
      doc.project_id = project_id
      return of(doc)
    }
    return this.backend.createSummary(summary, project_id, silent).pipe(
      filter((event): event is HttpResponse<any> => event.type === HttpEventType.Response),
      map((event: HttpResponse<any>) => {
        let doc = new IUCollection()
        //console.log("backend.createSummary");
        //console.log(event.body);
        doc.reconsolidate(event.body);
        //console.log(doc);
        return doc;
      })
    );
  }

  deleteSummary(summary:IUCollection): Observable<any> {
    if(this.offlineMode){
      return of(void 0)
    }
    return this.backend.deleteSummary(summary)
  }



  __updateDBSummary(summary: IUCollection, silent: boolean): Observable <any>{
    return this.backend.updateSummary(summary, silent).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          if (!silent) {
            console.log(`Summary file update is ${percentDone}% complete.`);
          }
        } else if (event.type === HttpEventType.Response) {
          if (!silent) {
            console.log('Summary updated successfully.');
          }
        }
      }));
  }

  updateProject(project: Project, silent: boolean): Observable<void> {
    if( this.offlineMode ){
      return of(void 0);
    }
    return this.backend.updateProject(project).pipe(
        tap(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percentDone = Math.round((100 * event.loaded) / event.total);
            if (!silent) {
              console.log(`Project update is ${percentDone}% complete.`);
            }
          } else if (event.type === HttpEventType.Response) {
            if (!silent) {
              console.log('project updated successfully.');
            }
          }
        }),
      map(() => void 0));

  }


  updateCurProject(
    proj: Project,
    sync: boolean = false,
    fromManager: boolean = false,
    replacementSource: IUCollection = null,
    summaryAddQueue: Set<IUCollection> = null,
    summaryRemovalQueue: Set<IUCollection> = null
  ): Observable<void>{
    if (this.offlineMode || !sync) {
      // if we are in offline mode or sync is disabled skip DB calls
      this.__updateCurProject(proj);
      return of(void 0);
    }

    // Update the db
    let source_request$ = null;
    let summary_requests$: Observable<unknown>[] = [];

    if (fromManager){
      //I'm modifying the project from the project manager.
      //get the new source only if it differs from the one in storage
      if (replacementSource){
        if (replacementSource != proj.sourceDoc){
          source_request$ = this.updateSource(replacementSource).pipe(
            tap( (new_source: IUCollection) => proj.sourceDoc = new_source)
          )
        }
      }
      //Do not update existing summaries, just add or remove them based on the queues
      const add_summaries_queue$ = Array.from(summaryAddQueue ?? []).map(
        summary => this.createSummary(summary, proj._id, false).pipe(
          tap( (new_summary : IUCollection) => {
            //console.log("new_summary")
            //console.log(new_summary);
            proj.summaryDocs.push(new_summary);
          })
        )
      );

      const removed_summaries_queue$ = Array.from(summaryRemovalQueue ?? []).map(
        summary => this.deleteSummary(summary).pipe(
        tap ( () => proj.summaryDocs = proj.summaryDocs.filter(s => s._id !== summary._id)))
      );

      summary_requests$ = [ ...add_summaries_queue$, ... removed_summaries_queue$]

    } else {
      //I'm updating the project either silently or through the document editors
      source_request$ = this.updateSource(proj.sourceDoc).pipe(
            tap( (new_source: IUCollection) => proj.sourceDoc = new_source)
          )
      //We are not adding/removing summaries, so we should update existing ones instead
      summary_requests$ = [ 
        ...proj.summaryDocs.map(summary => this.__updateDBSummary(summary, true))
      ]
    }

    const requests: Observable<unknown>[] = [
      ...(source_request$ ? [source_request$] : []), //turn the source into a list to handle null
      ...summary_requests$
    ];

    return forkJoin(requests).pipe(
      switchMap(() => this.updateProject(proj, true)),
      tap (() => this.__updateCurProject(proj)),
      map(() => void 0),
      catchError(err => {
        console.error('Error syncing project files:', err);
        return throwError(() => err);
      })
      );
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

  __updateWorkSummary (summary: IUCollection){
    this.work_summary_support = summary;
    this.work_summary.next(this.work_summary_support);
    this.cur_project_support.summaryDocs[this.work_summary_idx] = summary;
    this.cur_project.next(this.cur_project_support);

    // update full projects in memory
    this.projects_support[this.cur_project_idx] = this.cur_project_support;
    this.projects.next(this.projects_support);

    this.saveProjects();
  }

  updateWorkSummary(summary : IUCollection, sync: boolean = false): Observable<void>{
    if (this.offlineMode || !sync){
      this.__updateWorkSummary(summary);
      return of(void 0)
    }
    return this.__updateDBSummary(summary, true).pipe(
      tap(event => {
        if (event.type === HttpEventType.Response) {
          this.__updateWorkSummary(summary);
        }
      }));    
  }

  /**
   * Redundant?
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

   */

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
  /**
   * Redundant?

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
  */

  getClickedSourceIU(): Observable<IdeaUnit>{
    return this.clicked_source_iu.asObservable();
  }

  getClickedSummaryIU(): Observable<IdeaUnit>{
    return this.clicked_summary_iu.asObservable();
  }

  /// SIMS ///

  updateSuggestions():void{
    console.log("Updating IU recommendations");
    if (this.offlineMode) {
      // Do not provide similarity services in offline mode
      const emptySims = { "sims" : null}
      this.__addReceivedSimilarity( emptySims )
    } else{
    this.backend.getSimPredictions(this.work_source_support, this.work_summary_support).subscribe({
      next: event => {
        if (event.type === HttpEventType.DownloadProgress && event.total) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          console.log(`Upload is ${percentDone}% loaded.`);
        }
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<any>;
          this.__addReceivedSimilarity(response.body);
          console.log(response.body)
          console.log("Similarities are ready!");
        }
      },
      error: err => {
        console.error("Similarities Error:", err);
      }
    });
    }
  }

  __addReceivedSimilarity(simsDoc: Object): void{
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
