import { Component, AfterViewInit, ViewChild } from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-summary-reader',
  templateUrl: './summary-reader.component.html',
  styleUrls: ['./summary-reader.component.sass']
})
export class SummaryReaderComponent implements AfterViewInit {

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary: IUCollection)=>{
      this.doc = summary;
      this.summary_idx = storage.work_summary_idx;
      this.support_array = [];
      for(let summary of storage.cur_project_support.summaryDocs){
        this.support_array.push(summary.doc_name);
      }
      console.log(summary);
      console.log(summary.constructor.name);
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

  support_array = [];
  summary_idx : number = null;
  doc: IUCollection = null;
}
