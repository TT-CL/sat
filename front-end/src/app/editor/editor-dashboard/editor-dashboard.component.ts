import { Component, OnInit } from '@angular/core';
//import { map } from 'rxjs/operators';
//import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { IdeaUnit, IUCollection, Project } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { ComponentPortal, Portal } from '@angular/cdk/portal';

import { SummaryCardComponent } from '../summary-card/summary-card.component';
import { SourceCardComponent } from '../source-card/source-card.component';
import { ProjectManagerComponent } from '../project-manager/project-manager.component';
import { ProjectDownloaderComponent } from '../project-downloader/project-downloader.component';

import { BehaviorSubject } from 'rxjs';

enum Modes {
  Both = 'both',
  Source = 'source',
  Summary = 'summary',
}

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.sass']
})
export class EditorDashboardComponent implements OnInit{

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    //first of all, get the current project index to access the obj in memory
    this.project_index = storage.cur_project_idx;
    //If I am not working on a project, redirect to the homepage
    if (this.project_index == null){
      router.navigate(["/"]);
    }

    //subscribing the project to be refreshed after each update
    this.storage.getCurProject().subscribe((proj) => {
        this.project = proj;
        if(proj) this.hasSummaries = proj.hasSummaries();
      });

    //initialize the view subject to allow observer behaviour
    this.view = new BehaviorSubject<string>(null);
    
    // listen to view changes
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.view.next(route.snapshot.params["view"]);
      }
    });
  }

  ngOnInit() : void {
    //initialize the components
    this.sourceCardPortal = new ComponentPortal(SourceCardComponent);
    this.projectManagerPortal = new ComponentPortal(ProjectManagerComponent);
    this.projectDownloaderPortal = new ComponentPortal(ProjectDownloaderComponent);
    if (this.hasSummaries) {
      this.summaryCardPortal = new ComponentPortal(SummaryCardComponent);
    }
    this.view.asObservable().subscribe((view) => {
      console.log("observed view: "+view);
      switch (view) {
        case "manager":{
          //this is a special case where I have to show the contents of the
          //projectManagerPortal inside the Summary Outlet.
          //this will allow some animations later in development when switching
          //between views
          this.summaryOutlet = this.projectManagerPortal;
          this.sourceOutlet = null;
          this.mode = Modes.Summary
          break;
        }
        case "download": {
          //this is a special case where I have to show the contents of the
          //projectManagerPortal inside the Summary Outlet.
          //this will allow some animations later in development when switching
          //between views
          this.summaryOutlet = this.projectDownloaderPortal;
          this.sourceOutlet = null;
          this.mode = Modes.Summary
          break;
        }
        default:{
          this.sourceOutlet = this.sourceCardPortal;
          if (this.hasSummaries) {
            if (!this.summaryCardPortal){
              this.summaryCardPortal = new ComponentPortal(SummaryCardComponent);
            }
            this.summaryOutlet = this.summaryCardPortal;
            this.mode = Modes.Both;
          }else{
            this.summaryOutlet = null;
            this.mode = Modes.Source;
          }
          break;
        }
      }
    });
  }


  project_index : number = null;
  project : Project;
  hasSummaries: boolean = false;

  mode: Modes = Modes.Both;

  summaryOutlet: Portal<any>;
  sourceOutlet: Portal<any>;

  summaryCardPortal : ComponentPortal<SummaryCardComponent>;
  sourceCardPortal : ComponentPortal<SourceCardComponent>;
  projectManagerPortal : ComponentPortal<ProjectManagerComponent>;
  projectDownloaderPortal : ComponentPortal<ProjectDownloaderComponent>;

  view: BehaviorSubject<string>;
}