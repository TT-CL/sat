import { Component, OnInit } from '@angular/core';
import { ExporterService } from '../../exporter.service';

import { Project, IUCollection} from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';
import { GrayFlexContainerComponent } from 'src/app/utils/gray-flex-container/gray-flex-container.component';
import { DocCardComponent } from 'src/app/utils/doc-card/doc-card.component';

@Component({
    selector: 'app-project-downloader',
    templateUrl: './project-downloader.component.html',
    styleUrls: ['./project-downloader.component.sass'],
    standalone: true,
    imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    GrayFlexContainerComponent,
    DocCardComponent
]
})
export class ProjectDownloaderComponent implements OnInit {

  constructor(
    private storage: StorageService,
    public exporter: ExporterService,
  ) {
    storage.getCurProject().subscribe(proj =>{
      this.curProj = proj;
    });
  }

  ngOnInit(): void {
  }

  curProj: Project;
  
  downloadDoc(doc: IUCollection){
    this.exporter.generatedDocSpreadsheet(doc);
    return false;
  }

  downloadProject() {
    this.exporter.generateProjectSpreadsheet(this.curProj);
  }
}
