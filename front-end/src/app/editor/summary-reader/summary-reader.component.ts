import { Component, Input, OnInit } from '@angular/core';

import { IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';


@Component({
  selector: 'app-summary-reader',
  templateUrl: './summary-reader.component.html',
  styleUrls: ['./summary-reader.component.sass'],
  standalone: true,
  imports: []
})
export class SummaryReaderComponent implements OnInit {

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary: IUCollection | null) => {
      if (summary !== null) {
        this.doc = summary;
        this.summary_idx = storage.work_summary_idx;
      }
    });
  }

  ngOnInit(): void {
  }

  summary_idx: number | null = null;
  doc: IUCollection | null = null;

  @Input() showOverlay!: () => void;
  @Input() hideOverlay!: () => void;
}
