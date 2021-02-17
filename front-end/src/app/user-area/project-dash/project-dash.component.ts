import { Component, OnInit, Input} from '@angular/core';

import { Project } from '../../data-objects'
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-project-dash',
  templateUrl: './project-dash.component.html',
  styleUrls: ['./project-dash.component.sass']
})
export class ProjectDashComponent implements OnInit {

  constructor(public storage : StorageService) { }

  @Input() project : Project;
  ngOnInit(): void {
  }

}
