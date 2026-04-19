import { Component, ViewChild, ElementRef} from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';

import { forkJoin, Observable, of} from 'rxjs';

import { OverlayService } from '../../overlay.service';
import { UploadOverlayComponent } from 'src/app/utils/upload-overlay/upload-overlay.component';

import { IUCollection, Project } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { NLPService } from 'src/app/nlp.service';

import { HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';

import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SummaryMinicardComponent } from 'src/app/utils/summary-minicard/summary-minicard.component';
import { GrayFlexContainerComponent } from 'src/app/utils/gray-flex-container/gray-flex-container.component';

@Component({
    selector: 'app-new-project',
    templateUrl: './new-project.component.html',
    styleUrls: ['./new-project.component.sass'],
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      RouterModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatDividerModule,
      SummaryMinicardComponent,
      GrayFlexContainerComponent
    ]
})
export class NewProjectComponent {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private overlayService: OverlayService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private nlp: NLPService) { }

  projectForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: [''],
    source: ['', Validators.required],
  });


  sourceFile: File | null = null;
  sourceFormValue : string = "";
  sourceFormFieldClass : string = "";

  summaryFiles = new Set<File>();

  parsedSource: IUCollection = null;
  parsedSummaries= new Set<IUCollection>();

  docNumber: number;
  progress: number;

  //catch the file input elements
  @ViewChild('sourceInput')
  sourceInput;

  @ViewChild('summaryInput')
  summaryInput;

  @ViewChild('sourceForm')
  sourceForm;

  //show file selection window
  onClickSourceForm(): void {
    this.sourceInput.nativeElement.click();
  }

  onSourcePickerCancel():void{
    this.sourceForm.nativeElement.blur();
  }

  //save the source file
  onChangeSourceInput(): void {
    const files: { [key: string]: File } = this.sourceInput.nativeElement.files;
    this.sourceFormFieldClass = "";
    if (files[0]){
      this.nlp.parseRawIUCollection(files[0], "source").subscribe({
        next: doc => {
          this.parsedSource = doc;
          //set the value of the form to the name of the file
          this.sourceFormValue = files[0].name;
        },
        error: err => console.error("Error parsing new source document. Error:" + err)
      })
    }
    //Deselect the source fiele field
    this.sourceForm.nativeElement.blur();
  }

  removesourceFile(): void {
    this.parsedSource = null;
    this.sourceFormValue = "";
    this.projectForm.controls.source.reset();
  }

  newSummary(): void {
    this.summaryInput.nativeElement.click();
  }

  //save the summary file
  onChangeSummaryInput(): void {
    const fileList = this.summaryInput.nativeElement.files;
    const summaryFiles: File[] = fileList ? Array.from(fileList) : [];

    const requests = summaryFiles.map(file =>
      this.nlp.parseRawIUCollection(file, 'summary')
    );

    forkJoin(requests).subscribe({
      next: (docs) => {
        docs.forEach(doc =>{
          this.parsedSummaries.add(doc);
        });
      },
      error: (err) => {
        console.error('Error parsing summary files:', err);
      }
    });
  }

  //function to remove a summary from the list
  removeSummary(summary: IUCollection): void{
    this.parsedSummaries.delete(summary);
  }

  // overlay controls
  @ViewChild("overlayOrigin") overlayOrigin: ElementRef;
  overlayRef = null;

  showOverlay(){
    this.overlayRef = this.overlayService.showOverlay(this.overlayOrigin, UploadOverlayComponent);
  }
  hideOverlay(){
    this.overlayService.detach(this.overlayRef);
  }

  fileRead(): void {
    //Upload of local file is complete
    
  }

  redirectOut() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  redirectUnauthorized() {
    this.router.navigate(['/unauthorized']);
  }

  onSubmit(): void{
    this.showOverlay();
    // create project
    let title = this.projectForm.value.title
    let description = this.projectForm.value.description;
    let proj = new Project();
    proj.name = title;
    proj.sourceDoc = this.parsedSource;
    proj.creation_time = new Date();
    proj.last_edit = proj.creation_time;
    if (description && description != "") {
      proj.description = description;
    }
    if (this.parsedSummaries.size > 0) {
      proj.summaryDocs = Array.from(this.parsedSummaries);
    }

    this.storage.addProject(proj).subscribe({
      next: () => {
        console.log("Project created successfully");
        this.hideOverlay();
        this.redirectOut();
      },
      error: err => {
        console.log("Error creating Project:", err);
        if(err.status == 401){
          this.redirectUnauthorized()
        }
      }
    });
  }
}
