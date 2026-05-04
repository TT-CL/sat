import { HttpEventType, HttpResponse, HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayService } from 'src/app/overlay.service';
import { UploadOverlayComponent } from 'src/app/utils/upload-overlay/upload-overlay.component';

import { IUCollection, Project } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog'
import { SummaryMinicardComponent } from 'src/app/utils/summary-minicard/summary-minicard.component';
import { ConfirmDialogComponent } from 'src/app/utils/confirm-dialog/confirm-dialog.component';
import { forkJoin } from 'rxjs';
import { NLPService } from 'src/app/nlp.service';
import { GrayFlexContainerComponent } from 'src/app/utils/gray-flex-container/gray-flex-container.component';

type FileOrDoc = File | IUCollection;


@Component({
    selector: 'app-project-manager',
    templateUrl: './project-manager.component.html',
    styleUrls: ['./project-manager.component.sass'],
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatCardModule,
      MatDividerModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      SummaryMinicardComponent,
      GrayFlexContainerComponent
    ]
})
export class ProjectManagerComponent implements OnInit {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private overlayService: OverlayService,
    private storage: StorageService,
    private router: Router,
    private dialog: MatDialog,
    private nlp: NLPService,
    private http: HttpClient) {
  }

  ngOnInit(): void {
    this.storage.getCurProject().subscribe((proj: Project) => {
      //console.log(proj);
      this.cur_proj = proj;
      this.projTitle = proj.name;
      //this.projDescription = proj.description;
      this.sourceFile = proj.sourceDoc;
      this.summaryFiles = new Set(proj.summaryDocs);
      this.summaryRemovalQueue = new Set<IUCollection>();
      this.summaryAddQueue = new Set<IUCollection>();
      this.projDescription = proj.description;
      this.sourceFormValue = proj.sourceDoc.doc_name;
      this.projectForm = this.formBuilder.group({
        title: [this.projTitle, Validators.required],
        description: [this.projDescription],
        source: [''],
        sourceValue: [this.sourceFormValue, Validators.required]
      });
    });
  }

  getFileName(file:FileOrDoc): string{
    if (file instanceof File){
      return file.name;
    }else if (file instanceof IUCollection){
      return file.doc_name;
    }
  }

  cur_proj : Project | null = null;
  projDescription: string | null = null;
  projTitle: string | null= null;

  changedFlag: boolean = false;

  projectForm : UntypedFormGroup | null = null;

  sourceFile: IUCollection | null = null;
  sourceFormValue: string = "";
  sourceFormFieldClass: string = "";

  summaryFiles = new Set<IUCollection>();
  summaryRemovalQueue = new Set<IUCollection>();
  summaryAddQueue = new Set<IUCollection>();

  parsedSource: IUCollection | null= null;
  parsedSummaries: IUCollection[] = [];

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
          const cur_src = this.cur_proj.sourceDoc;
          // copy over db data
          doc._id = cur_src._id;
          doc.user_id = cur_src.user_id;
          doc.project_id = cur_src.project_id;
          doc.history_id = cur_src.history_id;
          doc.deleted = cur_src.deleted;
          this.sourceFile = doc;
          //set the value of the form to the name of the file
          this.sourceFormValue = files[0].name;
          //remove animation classes
          this.projectForm.controls.sourceValue.setValue(files[0].name);
        },
        error: err => console.error("Error parsing new source document. Error:" + err)
      })
    }
    //Deselect the source fiele field
    this.sourceForm.nativeElement.blur();
  }

  removesourceFile(): void {
    this.sourceFile = null;
    this.sourceFormValue = "";
    this.projectForm.controls.source.reset();
    this.projectForm.controls.sourceValue.reset();
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
          this.summaryFiles.add(doc);
          this.summaryAddQueue.add(doc);
        });
      },
      error: (err) => {
        console.error('Error parsing summary files:', err);
      }
    });
  }

  openDeleteProjectDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Delete Project',
        message: 'Are you sure you want to delete this project?\nThis action cannot be undone.',
        confirmText: 'Delete Project',
        confirmColor: 'warn',
        cancelText: 'Cancel',
        cancelColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteProject();
      }
    });
  }

  openDeleteSummaryDialog(summary: IUCollection): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Delete Summary',
        message: `Are you sure you want to remove summary ${this.getFileName(summary)}?\nThis action cannot be undone.`,
        confirmText: 'Delete Summary',
        confirmColor: 'warn',
        cancelText: 'Cancel',
        cancelColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.removeSummary(summary);
      }
    });
  }

  deleteProject(): void {
    console.log('Deleting Project');
    this.storage.removeProject(this.cur_proj).subscribe({
      next: () => {
        console.log('Project successfully removed');
        this.router.navigate(['/projects']);
      },
      error: err => {
        console.error('Failed to delete project. Error:' + err);
      }
    });
  }

  //function to remove a summary from the list
  removeSummary(summary: IUCollection): void{
    this.summaryFiles.delete(summary);
    if (this.summaryAddQueue.has(summary)){
      this.summaryAddQueue.delete(summary);
    } else {
      this.summaryRemovalQueue.add(summary);
    }
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

  onSubmit(): void{
    console.log("Saving project")
    this.showOverlay()
    this.storage.updateCurProject(
      this.cur_proj,
      true,
      true,
      this.sourceFile,
      this.summaryAddQueue,
      this.summaryRemovalQueue
    ).subscribe({
      complete: () => {
        this.ngOnInit();
        this.hideOverlay();
      },
      error: err => console.error("Error while updating the project: "+ err)
    })
  }
}
