import { Component, OnInit } from '@angular/core';

import { IdeaUnit, IUCollection } from '../../objects/objects.module';

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
        this.simsStack = sims;
      });
  }

  ngOnInit(): void {
  }

  doc: IUCollection = null;
  summaryDoc: IUCollection = null;

  selected_iu: IdeaUnit = null;
  selected_summary_iu: IdeaUnit = null;
  simsStack: Object = null;

  
  public get sims() : Object {
    if (this.simsStack && this.simsStack[this.summaryDoc.doc_name]){
      return this.simsStack[this.summaryDoc.doc_name];
    }else{
      return null;
    }
  }
  

  linkClick(seg) : void {
    //console.log("click");
    //if I have an input link
    if (this.selected_summary_iu){
      this.selected_iu = this.doc.ius[seg.iu];
      // I do not want to update the source, as it can have multiple summaries
      //this.selected_iu.toggleIuLink(this.selected_summary_iu);
      this.selected_summary_iu.toggleIuLink(this.selected_iu);
      this.summaryDoc.ius[this.selected_summary_iu.label] = this.selected_summary_iu;
      this.storage.updateWorkSummary(this.summaryDoc, true);
      this.storage.switchClickedSourceIU(this.selected_iu);
    }
  }

  topNSims(iu: IdeaUnit, n: number){
    /**
    let temp_ius = Array(Object.keys(this.summaryDoc.ius))[0]
    let card_iu = temp_ius.length
    let iu_idx = temp_ius.indexOf(this.selected_summary_iu.label)
    
    let mean = (iu_idx+1)/card_iu
    let sigma = 0.3

    let card_source_iu = Array(Object.keys(this.doc.ius))[0].length

    
    let sims = this.sims[iu.label]
    
    return sims.sort(function(a, b){
      //sort by label
      var labelA = Number(a[1].substring(1))
      var labelB = Number(b[1].substring(1))
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    })
    .map(
        (value, index) => {
          // gaussian adjustment
          let x = (index + 1) / card_source_iu
          let adjusted = value[2] * Math.exp(-1 / 2 * ((x - mean) ^ 2 / sigma ^ 2))
          let res = [value[0], value[1], value[2], adjusted]
          return res
        }
    )
    .sort(function (a, b) {
      //sort by sim
      var simA = a[3]
      var simB = b[3]
      if (simA > simB) {
        return -1;
      }
      if (simA < simB) {
        return 1;
      }
      return 0;
    }).slice(0, n).map(
      (value, index) => {
        return value[1]
      });
    */

    //return the second column of the first n records
    return this.sims[iu.label].slice(0, n).map(
      (value,index)=>{
        return value[1]});
  }
}
