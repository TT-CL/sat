import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-spinner-overlay',
    templateUrl: './spinner-overlay.component.html',
    styleUrls: ['./spinner-overlay.component.sass'],
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatProgressSpinnerModule
        ]
})
export class SpinnerOverlayComponent {
}
