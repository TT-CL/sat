import { Component, OnInit } from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-summary-reader',
  templateUrl: './summary-reader.component.html',
  styleUrls: ['./summary-reader.component.sass']
})
export class SummaryReaderComponent implements OnInit {

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary)=>{
      this.doc = summary;
    });
  }

  ngOnInit(): void {
  }

  doc: IUCollection = null;
}
