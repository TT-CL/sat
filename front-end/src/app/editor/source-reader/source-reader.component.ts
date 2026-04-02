import { Component, OnInit, Inject } from '@angular/core';

import { IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-source-reader',
    templateUrl: './source-reader.component.html',
    styleUrls: ['./source-reader.component.sass'],
    standalone: true,
    imports: [
      CommonModule
    ]
})
export class SourceReaderComponent implements OnInit {

  constructor(private storage: StorageService) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
      });
  }

  ngOnInit(): void {
  }

  doc: IUCollection = null;
}
