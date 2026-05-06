import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';

import { IUCollection } from '../../objects/objects.module';
import { StorageService } from '../../storage.service';

import { MatSelect, MatSelectModule } from '@angular/material/select';

import { ComponentPortal, Portal, PortalModule } from '@angular/cdk/portal';

import { BehaviorSubject } from 'rxjs';

import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { SummaryReaderComponent } from '../summary-reader/summary-reader.component';
import { SummaryIuComponent } from '../summary-iu/summary-iu.component';
import { SummaryLinkComponent } from '../summary-link/summary-link.component';
import { SummaryEditorComponent } from '../summary-editor/summary-editor.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.sass'],
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    PortalModule
  ]
})
export class SummaryCardComponent implements AfterViewInit, OnInit {

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    storage.getWorkSummary().subscribe((summary: IUCollection | null) => {
      if (summary !== null) {
        this.doc = summary;
        this.summary_idx = storage.work_summary_idx;
        this.summary_array = [];
        if (storage.cur_project_support !== null && storage.cur_project_support.summaryDocs !== null) {
          storage.cur_project_support.summaryDocs.forEach(summary => {
            if (summary !== null && summary.doc_name !== null) {
              this.summary_array.push(summary.doc_name);
            }
          });
        }
        /**
        console.log(summary);
        console.log(summary.constructor.name);
        **/
      }
    });

    //initialize the view subject to allow observer behaviour
    this.view = new BehaviorSubject<string>("");

    //this is called each time we change the url
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.view.next(route.snapshot.params["view"]);
      }
    });

    storage.getWorkSource().subscribe((source: IUCollection | null) => {
      this.sourceDoc = source;
      if (this.view.value == "link") {
        this.updateSuggestions();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.summary_array.length > 1) {
      this.selector.selectionChange.subscribe((evt) => {
        this.storage.setWorkSummaryIdx(evt.value);
        this.updateSuggestions();
      });
    }
  }

  @ViewChild("selector") selector !: MatSelect;

  ngOnInit(): void {
    this.summaryReaderPortal = new ComponentPortal(SummaryReaderComponent);
    this.summaryIuPortal = new ComponentPortal(SummaryIuComponent);
    this.summaryLinkPortal = new ComponentPortal(SummaryLinkComponent);
    this.summaryEditorPortal = new ComponentPortal(SummaryEditorComponent);

    this.view.asObservable().subscribe((view) => {
      this.handleViewChange(view);
    });

    //forcibly trigger route update on init
    this.view.next(this.route.snapshot.params["view"]);
  }

  handleViewChange(view: string) {
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
        this.updateSuggestions();
        break;
      }
      case "edit": {
        this.portalOutlet = this.summaryEditorPortal;
        break;
      }
      default: {
        this.portalOutlet = this.summaryReaderPortal;
        break;
      }
    }
  }

  portalOutlet?: Portal<any>;

  view: BehaviorSubject<string>;
  summaryReaderPortal !: ComponentPortal<SummaryReaderComponent>;
  summaryIuPortal !: ComponentPortal<SummaryIuComponent>;
  summaryLinkPortal !: ComponentPortal<SummaryLinkComponent>;
  summaryEditorPortal !: ComponentPortal<SummaryEditorComponent>;

  summary_array: Array<string> = [];
  summary_idx: number | null = null;
  doc: IUCollection | null = null;
  sourceDoc: IUCollection | null = null;

  updateSuggestions(): void {
    //only update suggestions if I am in the link view
    if (this.view && this.view.value == "link") {
      this.storage.updateSuggestions();
    }
  }
}
