import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';


@Component({
    selector: 'app-upload-overlay',
    templateUrl: './upload-overlay.component.html',
    styleUrls: ['./upload-overlay.component.sass'],
    standalone: true,
    imports: [
    MatCardModule,
    MatProgressSpinnerModule
]
})
export class UploadOverlayComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
