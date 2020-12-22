import { Component, OnInit } from '@angular/core';
//import { map } from 'rxjs/operators';
//import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Word, Sent, Segment, IdeaUnit, IUCollection } from '../data-objects';

import { TextService } from '../text.service';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.css']
})
export class EditorDashboardComponent implements OnInit{

  summary_file: Object = null;
  source_file: Object = null;
  //Default
  selectedView: String = "textView";
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
      if(this.dev_mode){
        this.textService.getSampleSource()
          .subscribe(source => this.source_file = source);
        this.textService.getSampleSummary()
          .subscribe(summary => this.summary_file = summary);

        this.raiseFlags("source");
        this.raiseFlags("summary");
      }
    }

}
