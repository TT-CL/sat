
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IUCollection } from '../../objects/iu-collection';

type FileOrDoc = File | IUCollection;

@Component({
  selector: 'app-summary-minicard',
  templateUrl: './summary-minicard.component.html',
  styleUrls: ['./summary-minicard.component.sass'],
  standalone: true,
  imports: [
    MatIconModule
  ]
})
export class SummaryMinicardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    if (this.file instanceof File) {
      this.name = this.file.name;
    } else if (this.file instanceof IUCollection) {
      this.name = this.file.doc_name ? this.file.doc_name : "";
    }
  }

  @Input() file !: FileOrDoc;
  @Input() new_file !: boolean;

  name!: string;

  @Output() close = new EventEmitter<FileOrDoc>();
  @Output() new = new EventEmitter<void>();

}
