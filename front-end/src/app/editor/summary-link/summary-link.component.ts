import { Component, OnInit } from '@angular/core';

import { IdeaUnit, Segment, IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-summary-link',
  templateUrl: './summary-link.component.html',
  styleUrls: ['./summary-link.component.sass']
})
export class SummaryLinkComponent implements OnInit {

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary: IUCollection)=>{
      this.doc = summary;
      this.summary_idx = storage.work_summary_idx;
      //console.log(this.doc);
    });

    storage.getClickedSourceIU().subscribe((iu)=>{
      this.selected_source_iu = iu;
    });

    storage.getClickedSummaryIU().subscribe((iu)=>{
      this.selected_iu = iu;
    });
  }

  ngOnInit(): void {
  }

  summary_idx : number = null;
  doc: IUCollection = null;

  selected_iu: IdeaUnit = null;
  selected_source_iu: IdeaUnit = null;

  linkClick(seg) : void {
    console.log("click");
    this.toggleIuSelect(this.doc.ius[seg.iu]);
  }

  toggleIuSelect(tog_iu: IdeaUnit = null) : void {
    if(tog_iu == null){
      //default case: deselect the IUS
      if (this.selected_iu){
        this.storage.switchClickedSummaryIU(null);
      }
    }else{
      if (this.selected_iu){
        //console.log("we have a pre selected iu");
        if (this.selected_iu.label != tog_iu.label){
          this.storage.switchClickedSummaryIU(tog_iu);
        }else{
          this.storage.switchClickedSummaryIU(null);
        }
      }else{
        this.storage.switchClickedSummaryIU(tog_iu);
      }
    }
  }
}
