import { Component, OnInit, Input} from '@angular/core';

import { StorageService } from '../../storage.service';

import { Project } from '../../data-objects';

import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-project-dash',
  templateUrl: './project-dash.component.html',
  styleUrls: ['./project-dash.component.sass']
})
export class ProjectDashComponent implements OnInit {

  constructor(public storage : StorageService) {
    this.projectsObservable = storage.getProjects();
    this.projectsObservable.subscribe(
      projs => {
        this.projects = projs;
      },(err)=>{
        //on error
      },()=>{
        //default
      });
  }

  ngOnInit(): void {
  }

  projectsObservable : Observable<Project[]>;
  projects : Project[] = [];

}
