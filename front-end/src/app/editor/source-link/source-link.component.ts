import { Component, OnInit } from '@angular/core';

import { IdeaUnit, IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-source-link',
  templateUrl: './source-link.component.html',
  styleUrls: ['./source-link.component.sass']
})
export class SourceLinkComponent implements OnInit {

  constructor(private storage: StorageService) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
        //console.log(source);
        //console.log("retrieving source");
      });

      storage.getWorkSummary().subscribe((summary)=>{
        this.summaryDoc = summary;
      });

      storage.getClickedSummaryIU().subscribe((iu)=>{
        this.selected_summary_iu = iu;
      });

      storage.getSimilarities().subscribe((sims)=>{
        this.sims = sims;
      });
  }

  ngOnInit(): void {
  }

  doc: IUCollection = null;
  summaryDoc: IUCollection = null;

  selected_iu: IdeaUnit = null;
  selected_summary_iu: IdeaUnit = null;
  sims: Object = null;

  linkClick(seg) : void {
    //console.log("click");
    //if I have an input link
    if (this.selected_summary_iu){
      this.selected_iu = this.doc.ius[seg.iu];
      // I do not want to update the source, as it can have multiple summaries
      //this.selected_iu.toggleIuLink(this.selected_summary_iu);
      this.selected_summary_iu.toggleIuLink(this.selected_iu);
      this.storage.updateWorkSummary(this.summaryDoc);
      this.storage.switchClickedSourceIU(this.selected_iu);
    }
  }

  topNSims(iu: IdeaUnit, n: number){
    //return the second column of the first n records
    return this.sims[iu.label].slice(0,n).map(
      (value,index)=>{return value[1]});
  }
}