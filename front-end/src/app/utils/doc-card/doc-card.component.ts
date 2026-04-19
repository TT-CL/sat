import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IUCollection } from 'src/app/objects/iu-collection';

type FileOrDoc = File | IUCollection;


@Component({
  selector: 'doc-card',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './doc-card.component.html',
  styleUrl: './doc-card.component.sass',
  standalone: true
})
export class DocCardComponent  implements OnInit{
  ngOnInit(): void {
    if (this.file instanceof File){
      this.name = this.file.name;
    }else if (this.file instanceof IUCollection){
      this.name = this.file.doc_name;
    }
  }

  @Input() file : FileOrDoc;
  @Input() type : "source" | "summary";

  name: string;

  @Output() download = new EventEmitter<void>();

}
