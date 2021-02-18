import { Component, OnInit, Input} from '@angular/core';
import { Project } from '../../data-objects';

@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass']
})
export class ProjectItemComponent implements OnInit {

  constructor() { }

  @Input() project : Project;
  @Input() index : number;

  numSummaries : number = 0;
  lastEdit : string;
  route : any[] = [];

  ngOnInit(): void {
    if(this.project.summaryDocs){
      this.numSummaries = this.project.summaryDocs.length;
    }
    this.lastEdit = this.project.last_edit.toUTCString();
    this.route.push("../editor");
    this.route.push(this.index);
    console.log("index: "+this.index);
  }

}
