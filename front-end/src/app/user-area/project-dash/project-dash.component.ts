import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';

import { StorageService } from '../../storage.service';

import { Project } from '../../objects/objects.module';
import { AuthService } from '../../auth.service';
import { pluck } from 'rxjs/operators';
import { OverlayService } from '../../overlay.service';
import { UploadOverlayComponent } from '../upload-overlay/upload-overlay.component';
import { BackEndService } from '../../back-end.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-project-dash',
  templateUrl: './project-dash.component.html',
  styleUrls: ['./project-dash.component.sass']
})
export class ProjectDashComponent implements OnInit {

  constructor(
    public storage : StorageService,
    private auth: AuthService,
    private overlayService: OverlayService,
    private backend: BackEndService,
    private router: Router,
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
      //files[0].type == "application/json"
      if (files[0].name.endsWith(".iuproj")) {
        const fileReader = new FileReader();
        fileReader.readAsText(files[0], "UTF-8");
        fileReader.onload = () => {
          // parse Json
          let anon_proj = JSON.parse(String(fileReader.result));
          // load Typescript methods
          let proj = new Project();
          proj.reconsolidate(anon_proj);
          // add project to session
          console.log(proj);
          this.showOverlay();
          this.restoreBackup(proj);
        }
        fileReader.onerror = (error) => {
          console.log(error);
        }
      }else{
        console.log("Incorrect file type.")
      }
    }
  }

  restoreBackup(proj: Project):void{
    //Sync the DB
    this.backend.createProject(proj).subscribe(
      event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          //console.log('${fName} is ${percentDone}% loaded.');
        } else if (event instanceof HttpResponse) {
          let proj = new Project();
          console.log(event.body);
          proj.reconsolidate(event.body);
          this.storage.addProject(proj);
        }
      },
      (err) => {
        console.log("Error restoring Project:", err);
        if (err.status == 401) {
          this.redirectUnauthorized()
        }
      }, () => {
        console.log("Project restored successfully");
        this.hideOverlay();
      });
  }

  redirectUnauthorized() {
    this.router.navigate(['/unauthorized']);
  }

  // overlay controls
  @ViewChild("overlayOrigin") overlayOrigin: ElementRef;
  overlayRef = null;
  showOverlay() {
    this.overlayRef = this.overlayService.showOverlay(this.overlayOrigin, UploadOverlayComponent);
  }
  hideOverlay() {
    this.overlayService.detach(this.overlayRef);
  }
}
