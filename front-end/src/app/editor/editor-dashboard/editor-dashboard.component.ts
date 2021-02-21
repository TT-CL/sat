import { Component, OnInit, Injector, InjectionToken } from '@angular/core';
//import { map } from 'rxjs/operators';
//import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Word, Segment, IdeaUnit, IUCollection, Project } from '../../data-objects';

import { TextService } from '../../text.service';
import { StorageService } from '../../storage.service';

import { of } from 'rxjs';
import {BehaviorSubject, Observable} from 'rxjs';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { ComponentPortal, Portal } from '@angular/cdk/portal';

import { SourceReaderComponent } from '../source-reader/source-reader.component';
import { SourceIuComponent } from '../source-iu/source-iu.component';

import { SummaryReaderComponent } from '../summary-reader/summary-reader.component';
import { SummaryIuComponent } from '../summary-iu/summary-iu.component';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.css']
})
export class EditorDashboardComponent implements OnInit{

  constructor(
    private textService : TextService,
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private injector: Injector,
  ) {
    //first of all, get the current project index to access the obj in memory
    this.project_index = storage.cur_project_idx;
    //If I am not working on a project, redirect to the homepage
    if (this.project_index == null){
      router.navigate(["/"]);
    }
    //initialize the view subject to allow observer behaviour
    this.view = new BehaviorSubject<string>(null);

    //subscribing the project to be refreshed after each update
    this.storage.getCurProject().subscribe((proj) => {
        this.project = proj;
        if(proj) this.hasSummaries = proj.hasSummaries();
      });
    //this is called each time we change the url
    router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd){
        this.view.next(route.snapshot.params["view"]);
      }
    });
  }

  ngOnInit() : void {
    //Initialize the portal components
    this.sourceReaderPortal = new ComponentPortal(SourceReaderComponent);
    this.sourceIuPortal = new ComponentPortal(SourceIuComponent);
    if(this.hasSummaries){
      this.summaryReaderPortal = new ComponentPortal(SummaryReaderComponent);
      this.summaryIuPortal = new ComponentPortal(SummaryIuComponent);
    }
    /**
    Debug printers
    console.log("index: " + this.project_index);
    console.log("Current Project:");
    console.log(this.project);
    console.log("Has summaries:");
    console.log(this.project.hasSummaries());
    **/
    //the following will be called each time we switch view from the toolbar
    this.view.asObservable().subscribe((view)=>{
      //console.log("observed view: "+view);
      if(this.hasSummaries){
        // Show both panes
        switch (view) {
            case "reader": {
              this.leftPortalOutlet = this.summaryReaderPortal;
              this.rightPortalOutlet = this.sourceReaderPortal;
              break;
            }
            case "iu": {
              this.leftPortalOutlet = this.summaryIuPortal;
              this.rightPortalOutlet = this.sourceIuPortal;
              break;
            }
            default: {
              this.leftPortalOutlet = this.summaryReaderPortal;
              this.rightPortalOutlet = this.sourceReaderPortal;
              break;
            }
        }
      }else{
        // show only the source text
        switch (view) {
            case "reader": {
              this.leftPortalOutlet = this.sourceReaderPortal;
              break;
            }
            case "iu": {
              this.leftPortalOutlet = this.sourceIuPortal;
              break;
            }
            default: {
              this.leftPortalOutlet = this.sourceReaderPortal;
              break;
            }
        }
      }

    });
  }

  project_index : number = null;
  project : Project;
  hasSummaries: boolean = false;

  view : BehaviorSubject<string>;

  leftPortalOutlet: Portal<any>;
  rightPortalOutlet: Portal<any>;

  sourceReaderPortal : ComponentPortal<SourceReaderComponent>;
  summaryReaderPortal : ComponentPortal<SummaryReaderComponent>;
  sourceIuPortal : ComponentPortal<SourceIuComponent>;
  summaryIuPortal : ComponentPortal<SummaryIuComponent>;


  summary_file: IUCollection = new IUCollection();
  source_file: IUCollection = new IUCollection();
  //Default
  selectedView: String = "textView";
  link_disabled_flag : boolean = true;
  //selectedView: String = "iuView";

  showToolbar: boolean = false;
  showSource: boolean = false;
  showSummary: boolean = false;

  // flick this on to automatically select the source files
  dev_mode: boolean = false;

  // link data objects
  // these objects are given in input to the two document-viewer modules
  // summaryLinkInput will contain an IU that was selected in a
  // source document-viewer and vice versa.
  summaryLinkInput: IdeaUnit;
  sourceLinkInput: IdeaUnit;

  raiseFlags(mode : string){
    switch(mode){
      case "source":
      this.showToolbar = true;
      this.showSource = true;
      break;

      case "summary":
      this.showToolbar = true;
      this.showSummary = true;
      break;

      default:
      this.showToolbar = false;
      this.showSource = false;
      this.showSummary = false;
    }
  }

  parseSummary(body) : void {
    this.summary_file.readDocument(body);
    this.raiseFlags("summary");
    if(! this.source_file.empty()){
      console.log("both files uploaded");
      this.link_disabled_flag = false;
    }
  }

  parseSource(body) : void {
    this.source_file.readDocument(body);
    this.raiseFlags("source");
    if(! this.summary_file.empty()){
      console.log("both files uploaded");
      this.link_disabled_flag = false;
    }
  }
}
