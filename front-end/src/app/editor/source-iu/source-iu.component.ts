import { Component, OnInit } from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-source-iu',
  templateUrl: './source-iu.component.html',
  styleUrls: ['./source-iu.component.sass']
})
export class SourceIuComponent implements OnInit {

  constructor(private storage: StorageService) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
      });
  }

  ngOnInit(): void {
  }

  doc: IUCollection = null;

}
