import { Component, Input, OnInit } from '@angular/core';

import { IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-source-iu',
    templateUrl: './source-iu.component.html',
    styleUrls: ['./source-iu.component.sass'],
    standalone: true,
    imports: [
      CommonModule,
      MatChipsModule
    ]
})
export class SourceIuComponent implements OnInit {

  constructor(private storage: StorageService) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
      });
  }

  ngOnInit(): void {
  }

  @Input() showOverlay!: () => void;
  @Input() hideOverlay!: () => void;
  
  doc: IUCollection | null = null;

}
