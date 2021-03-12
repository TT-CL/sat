import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { IUCollection } from 'src/app/objects/objects.module';

type FileOrDoc = File | IUCollection;

@Component({
  selector: 'app-summary-minicard',
  templateUrl: './summary-minicard.component.html',
  styleUrls: ['./summary-minicard.component.sass']
})
export class SummaryMinicardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    if (this.file instanceof File){
      this.name = this.file.name;
    }else if (this.file instanceof IUCollection){
      this.name = this.file.doc_name;
    }
  }

  @Input() file : FileOrDoc;

  name: string;

  @Output() close = new EventEmitter<FileOrDoc>();

}
