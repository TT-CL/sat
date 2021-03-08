import { Component, OnInit } from '@angular/core';
//import { map } from 'rxjs/operators';
//import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { IdeaUnit, IUCollection, Project } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

import { Router} from '@angular/router';

import { ComponentPortal, Portal } from '@angular/cdk/portal';

import { SummaryCardComponent } from '../summary-card/summary-card.component';

import { SourceCardComponent } from '../source-card/source-card.component';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.sass']
})
export class EditorDashboardComponent implements OnInit{

  constructor(
    private storage: StorageService,
    router: Router,
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
  }

  ngOnInit() : void {
    this.sourceCardPortal = new ComponentPortal(SourceCardComponent);
    this.sourceOutlet = this.sourceCardPortal;
    if(this.hasSummaries){
      this.summaryCardPortal = new ComponentPortal(SummaryCardComponent);
      this.summaryOutlet = this.summaryCardPortal;
    }else{
    }
  }

  project_index : number = null;
  project : Project;
  hasSummaries: boolean = false;

  summaryOutlet: Portal<any>;
  sourceOutlet: Portal<any>;

  summaryCardPortal : ComponentPortal<SummaryCardComponent>;
  sourceCardPortal : ComponentPortal<SourceCardComponent>;
}