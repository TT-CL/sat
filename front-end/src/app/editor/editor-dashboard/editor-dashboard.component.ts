import { Component, OnInit } from '@angular/core';
//import { map } from 'rxjs/operators';
//import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Word, Segment, IdeaUnit, IUCollection } from '../../data-objects';

import { TextService } from '../../text.service';
import { StorageService } from '../../storage.service';

import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.css']
})
export class EditorDashboardComponent implements OnInit{

  constructor(
    private textService : TextService,
    private storage: StorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() : void {
    console.log("Loaded project:");
    this.project_index = Number(this.route.snapshot.params.project_index);
    // this is unsafe. convert to subscribe in the future
    console.log(this.storage.projects_support[this.project_index]);
  }

  project_index : number;

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
