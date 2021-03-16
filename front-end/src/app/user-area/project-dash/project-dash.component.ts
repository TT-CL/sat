import { Component, OnInit, Input, ViewChild} from '@angular/core';

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

  @ViewChild('backupInput')
  backupInput;

  backupFileSelect(){
    const files: { [key: string]: File } = this.backupInput.nativeElement.files;
    if (files[0]) {
      console.log(files[0]);
      if (files[0].type == "application/json" 
          && files[0].name.endsWith(".iuproj")) {
        const fileReader = new FileReader();
        fileReader.readAsText(files[0], "UTF-8");
        fileReader.onload = () => {
          // parse Json
          let anon_proj = JSON.parse(String(fileReader.result));
          // load Typescript methods
          let proj = new Project();
          proj.reconsolidate(anon_proj);
          // add project to session
          this.storage.addProject(proj);
        }
        fileReader.onerror = (error) => {
          console.log(error);
        }
      }else{
        console.log("Incorrect file type.")
      }
    }
  }
}
