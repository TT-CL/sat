import { Component, Input, OnInit } from '@angular/core';

import { IdeaUnit, Segment, IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-link',
  templateUrl: './summary-link.component.html',
  styleUrls: ['./summary-link.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule
  ]
})
export class SummaryLinkComponent implements OnInit {

  constructor(private storage: StorageService) {
    storage.getWorkSummary().subscribe((summary: IUCollection | null) => {
      if (summary !== null) {
        this.doc = summary;
        this.summary_idx = storage.work_summary_idx;
        //console.log(this.doc);
      }
    });

    storage.getClickedSourceIU().subscribe((iu) => {
      this.selected_source_iu = iu;
    });

    storage.getClickedSummaryIU().subscribe((iu) => {
      this.selected_iu = iu;
    });
  }

  ngOnInit(): void {
  }

  summary_idx: number | null = null;
  doc: IUCollection | null = null;

  selected_iu: IdeaUnit | null = null;
  selected_source_iu: IdeaUnit | null = null;

  @Input() showOverlay!: () => void;
  @Input() hideOverlay!: () => void;

  linkClick(seg: Segment): void {
    if (this.doc === null) {
      throw new Error("Memory continuity error, doc is null");
    }

    if (seg.iu === null) {
      throw new Error("index error, seg.iu is null" + seg);
    }
    console.log("click");
    this.toggleIuSelect(this.doc.ius[seg.iu]);
  }

  toggleIuSelect(tog_iu: IdeaUnit | null = null): void {
    if (tog_iu === null) {
      //default case: deselect the IUS
      if (this.selected_iu) {
        this.storage.switchClickedSummaryIU(null);
      }
    } else {
      if (this.selected_iu) {
        //console.log("we have a pre selected iu");
        if (this.selected_iu.label != tog_iu.label) {
          this.storage.switchClickedSummaryIU(tog_iu);
        } else {
          this.storage.switchClickedSummaryIU(null);
        }
      } else {
        this.storage.switchClickedSummaryIU(tog_iu);
      }
    }
  }
}
