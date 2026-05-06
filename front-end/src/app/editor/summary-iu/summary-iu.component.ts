import { Component, Input, OnInit } from '@angular/core';

import { IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-iu',
  templateUrl: './summary-iu.component.html',
  styleUrls: ['./summary-iu.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule
  ]
})
export class SummaryIuComponent implements OnInit {

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

  support_array = [];
  summary_idx: number | null = null;
  doc: IUCollection | null = null;

  @Input() showOverlay!: () => void;
  @Input() hideOverlay!: () => void;
}
