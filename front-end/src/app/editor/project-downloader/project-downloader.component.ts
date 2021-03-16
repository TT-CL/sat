import { Component, OnInit } from '@angular/core';
import { ExporterService } from '../../exporter.service';

import { Project, IUCollection} from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-project-downloader',
  templateUrl: './project-downloader.component.html',
  styleUrls: ['./project-downloader.component.sass']
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
