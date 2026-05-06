import { Component, OnInit, Inject, Input } from '@angular/core';

import { IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';


@Component({
  selector: 'app-source-reader',
  templateUrl: './source-reader.component.html',
  styleUrls: ['./source-reader.component.sass'],
  standalone: true,
  imports: []
})
export class SourceReaderComponent implements OnInit {

  constructor(private storage: StorageService) {
    storage.getWorkSource().subscribe((source) => {
      this.doc = source;
    });
  }

  ngOnInit(): void {
  }

  @Input() showOverlay!: () => void;
  @Input() hideOverlay!: () => void;

  doc!: IUCollection | null;
}
