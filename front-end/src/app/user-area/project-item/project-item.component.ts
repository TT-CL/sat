import { Component, OnInit, Input} from '@angular/core';
import { Project } from '../../data-objects';

import { StorageService } from '../../storage.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass']
})
export class ProjectItemComponent implements OnInit {

  constructor(
    private router: Router,
    public storage : StorageService,
  ) { }

  @Input() project : Project;
  @Input() index : number;

  numSummaries : number = 0;
  lastEdit : string;

  editProject(){
    this.storage.setCurProjIndex(this.index);
    this.router.navigate(['/editor/reader']);
  }

  ngOnInit(): void {
    if(this.project.summaryDocs){
      this.numSummaries = this.project.summaryDocs.length;
    }
    this.lastEdit = this.project.last_edit.toUTCString();
    //console.log(this.project.last_edit);
    //console.log("index: "+this.index);
  }

}
