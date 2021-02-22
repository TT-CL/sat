import { Component, OnInit} from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-summary-iu',
  templateUrl: './summary-iu.component.html',
  styleUrls: ['./summary-iu.component.sass']
})
export class SummaryIuComponent implements OnInit{

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary: IUCollection)=>{
      this.doc = summary;
      this.summary_idx = storage.work_summary_idx;
    });
  }

  ngOnInit(): void {
  }

  support_array = [];
  summary_idx : number = null;
  doc: IUCollection = null;
}
