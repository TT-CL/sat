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

  userObserver = {
    next: user => {
      if(user){
        this.userName = user.getBasicProfile().getGivenName();
      }
    },
    error: err => console.error('User observer got an error: ' + err),
    complete: () => console.log('User observer got a complete notification'),
  };

  constructor(public storage : StorageService) {
    storage.getProjects().subscribe(
      projs => {
        this.projects = projs;
      },(err)=>{
        //on error
      },()=>{
        //default
      });

    storage.getUser().subscribe(this.userObserver);
  }

  ngOnInit(): void {
  }

  userName: string = "";
  projects : Project[] = [];

}
