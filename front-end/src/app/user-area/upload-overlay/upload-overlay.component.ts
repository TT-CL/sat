import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-upload-overlay',
    templateUrl: './upload-overlay.component.html',
    styleUrls: ['./upload-overlay.component.sass'],
    standalone: true,
    imports: [
      CommonModule,
      MatCardModule,
      MatProgressSpinnerModule
    ]
})
export class UploadOverlayComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
