import { Component, AfterViewInit, ViewChild, OnInit} from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

import { MatSelect } from '@angular/material/select';

import { ComponentPortal, Portal } from '@angular/cdk/portal';

import {BehaviorSubject, Observable} from 'rxjs';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { SummaryReaderComponent } from '../summary-reader/summary-reader.component';
import { SummaryIuComponent } from '../summary-iu/summary-iu.component';
import { SummaryLinkComponent } from '../summary-link/summary-link.component';


@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.sass']
})
export class SummaryCardComponent implements AfterViewInit, OnInit {

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    storage.getWorkSummary().subscribe((summary: IUCollection)=>{
      this.doc = summary;
      this.summary_idx = storage.work_summary_idx;
      this.support_array = [];
      for(let summary of storage.cur_project_support.summaryDocs){
        this.support_array.push(summary.doc_name);
      }
      /**
      console.log(summary);
      console.log(summary.constructor.name);
      **/
    });

    //initialize the view subject to allow observer behaviour
    this.view = new BehaviorSubject<string>(null);

    //this is called each time we change the url
    router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd){
        this.view.next(route.snapshot.params["view"]);
      }
    });
  }

  ngAfterViewInit(): void {
    if(this.support_array.length > 1){
      this.selector.selectionChange.subscribe((evt)=>{
        this.storage.setWorkSummaryIdx(evt.value);
      });
    }
  }

  @ViewChild("selector") selector : MatSelect;

  ngOnInit(): void {
    this.summaryReaderPortal = new ComponentPortal(SummaryReaderComponent);
    this.summaryIuPortal = new ComponentPortal(SummaryIuComponent);
    this.summaryLinkPortal = new ComponentPortal(SummaryLinkComponent);

    this.view.asObservable().subscribe((view)=>{
      //console.log("observed view: "+view);
      switch (view) {
          case "reader": {
            this.portalOutlet = this.summaryReaderPortal;
            break;
          }
          case "iu": {
            this.portalOutlet = this.summaryIuPortal;
            break;
          }
          case "link": {
            this.portalOutlet = this.summaryLinkPortal;
            break;
          }
          default: {
            this.portalOutlet = this.summaryReaderPortal;
            break;
          }
      }
    });
  }

  portalOutlet: Portal<any>;

  view : BehaviorSubject<string>;
  summaryReaderPortal : ComponentPortal<SummaryReaderComponent>;
  summaryIuPortal : ComponentPortal<SummaryIuComponent>;
  summaryLinkPortal : ComponentPortal<SummaryLinkComponent>;

  support_array = [];
  summary_idx : number = null;
  doc: IUCollection = null;
}
