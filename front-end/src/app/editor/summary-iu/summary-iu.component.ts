import { Component, OnInit } from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-summary-iu',
  templateUrl: './summary-iu.component.html',
  styleUrls: ['./summary-iu.component.sass']
})
export class SummaryIuComponent implements OnInit {

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary: IUCollection)=>{
      this.doc = summary;
      console.log(summary);
      console.log(summary.constructor.name);
    });
  }

  ngOnInit(): void {
  }

  doc: IUCollection = null;
}
