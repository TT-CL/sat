import { Component, OnInit } from '@angular/core';
//import { map } from 'rxjs/operators';
//import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Word, Segment, IdeaUnit, IUCollection } from '../data-objects';

import { TextService } from '../text.service';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.css']
})
export class EditorDashboardComponent implements OnInit{

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


  constructor(private textService : TextService) {}

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

  ngOnInit() : void {
    /*
      if(this.dev_mode){
        this.textService.getSampleSource()
          .subscribe(source => this.source_file.readDocument(source));
        this.textService.getSampleSummary()
          .subscribe(summary => this.summary_file.readDocument(summary));

        this.raiseFlags("source");
        this.raiseFlags("summary");
        this.link_disabled_flag = false;
      }
    */
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
