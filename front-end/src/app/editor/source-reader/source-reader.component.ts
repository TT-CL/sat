import { Component, OnInit, Inject } from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-source-reader',
  templateUrl: './source-reader.component.html',
  styleUrls: ['./source-reader.component.sass']
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
