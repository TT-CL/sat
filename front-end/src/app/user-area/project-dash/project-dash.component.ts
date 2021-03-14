import { Component, OnInit, Input} from '@angular/core';

import { StorageService } from '../../storage.service';

import { Project } from '../../objects/objects.module';
import { AuthService } from '../../auth.service';
import { pluck } from 'rxjs/operators';


@Component({
  selector: 'app-project-dash',
  templateUrl: './project-dash.component.html',
  styleUrls: ['./project-dash.component.sass']
})
export class ProjectDashComponent implements OnInit {

  constructor(
    public storage : StorageService,
    private auth: AuthService,
  ) { }

  public userName$ = this.auth.getGivenName();

  public projects$ = this.storage.getProjects();

  ngOnInit(): void {
  }

}
