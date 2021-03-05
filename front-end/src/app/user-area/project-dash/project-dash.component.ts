import { Component, OnInit, Input} from '@angular/core';

import { StorageService } from '../../storage.service';

import { Project } from '../../objects/objects.module';

import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-project-dash',
  templateUrl: './project-dash.component.html',
  styleUrls: ['./project-dash.component.sass']
})
export class ProjectDashComponent implements OnInit {

  constructor(
    public storage : StorageService,
    private oauthService: OAuthService
  ) {
    storage.getProjects().subscribe(
      projs => {this.projects = projs;});
  }

  ngOnInit(): void {
  }

  projects : Project[] = [];

  public get userName() {
      var claims = this.oauthService.getIdentityClaims();
      if (!claims){
        return null;
      }
      //console.log(claims);
      return claims['given_name'];
  }
}
