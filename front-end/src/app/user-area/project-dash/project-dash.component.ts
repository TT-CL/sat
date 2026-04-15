import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';

import { StorageService } from '../../storage.service';

import { Project } from '../../objects/objects.module';
import { AuthService } from '../../auth.service';
import { OverlayService } from '../../overlay.service';
import { UploadOverlayComponent } from '../upload-overlay/upload-overlay.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ProjectItemComponent } from '../project-item/project-item.component';


@Component({
    selector: 'app-project-dash',
    templateUrl: './project-dash.component.html',
    styleUrls: ['./project-dash.component.sass'],
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      MatCardModule,
      MatDividerModule,
      MatButtonModule,
      MatIconModule,
      ProjectItemComponent
    ]
})
export class ProjectDashComponent implements OnInit {

  constructor(
    public storage : StorageService,
    private auth: AuthService,
    private overlayService: OverlayService,
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
    this.storage.addProject(proj).subscribe({
      next: () => {
        console.log("Project restored successfully");
        this.hideOverlay();
      },
      error: err => {
        console.log("Error restoring Project:", err);
        if (err.status == 401) {
          this.router.navigate(['/unauthorized']);
        }
      }
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
