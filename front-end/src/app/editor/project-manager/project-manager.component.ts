import { HttpEventType, HttpResponse, HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { finalize, forkJoin } from 'rxjs';
import { NLPService } from '../../nlp.service';
import { OverlayService, ProgressRef } from '../../overlay.service';
import { UploadOverlayComponent } from '../../utils/upload-overlay/upload-overlay.component';
import { GrayFlexContainerComponent } from '../../utils/gray-flex-container/gray-flex-container.component';
import { SummaryMinicardComponent } from '../../utils/summary-minicard/summary-minicard.component';
import { ConfirmDialogComponent } from '../../utils/confirm-dialog/confirm-dialog.component';

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
    this.storage.getCurProject().subscribe((proj: Project | null) => {
      //console.log(proj);
      this.cur_proj = proj;
      this.projTitle = proj ? proj.name : null;
      //this.projDescription = proj.description;
      this.sourceFile = proj ? proj.sourceDoc : null;
      this.summaryFiles = proj ? new Set(proj.summaryDocs) : new Set();
      this.summaryRemovalQueue = new Set<IUCollection>();
      this.summaryAddQueue = new Set<IUCollection>();
      this.projDescription = proj ? proj.description : null;

      this.sourceFormValue = "";
      if (proj) {
        if (proj.sourceDoc) {
          this.sourceFormValue = proj.sourceDoc.doc_name ? proj.sourceDoc.doc_name : "";
        }
      }
      this.projectForm = this.formBuilder.group({
        title: [this.projTitle, Validators.required],
        description: [this.projDescription],
        source: [''],
        sourceValue: [this.sourceFormValue, Validators.required]
      });
    });
  }

  getFileName(file: FileOrDoc): string {
    if (file instanceof File) {
      return file.name;
    } else if (file instanceof IUCollection) {
      return file.doc_name || "";
    }
    throw new Error('Unexpected FileOrDoc type');
  }

  cur_proj!: Project | null;
  projDescription: string | null = null;
  projTitle: string | null = null;

  changedFlag: boolean = false;

  projectForm!: UntypedFormGroup;

  sourceFile: IUCollection | null = null;
  sourceFormValue: string = "";
  sourceFormFieldClass: string = "";

  summaryFiles = new Set<IUCollection>();
  summaryRemovalQueue = new Set<IUCollection>();
  summaryAddQueue = new Set<IUCollection>();

  parsedSource: IUCollection | null = null;
  parsedSummaries: IUCollection[] = [];

  docNumber?: number;
  progress?: number;

  //catch the file input elements
  @ViewChild('sourceInput') sourceInput!: ElementRef<HTMLInputElement>;

  @ViewChild('summaryInput') summaryInput!: ElementRef<HTMLInputElement>;

  @ViewChild('sourceForm') sourceForm!: ElementRef<HTMLFormElement>;

  //show file selection window
  onClickSourceForm(): void {
    this.sourceInput.nativeElement.click();
  }

  onSourcePickerCancel(): void {
    this.sourceForm.nativeElement.blur();
  }

  //save the source file
  onChangeSourceInput(): void {
    this.showOverlay();
    const file = this.sourceInput.nativeElement.files?.[0];
    if (!file){
      this.hideOverlay();
      return; //drop the function without raising errors
    } 
    this.sourceFormFieldClass = "";
    this.nlp.parseRawIUCollection(file, "source").pipe(
      finalize(() => {
        //Always run this at the end
        this.hideOverlay();
      })
    ).subscribe({
      next: doc => {
        if (this.cur_proj) {
          const cur_src = this.cur_proj.sourceDoc;
          if (cur_src) {
            // copy over db data
            doc._id = cur_src._id;
            doc.user_id = cur_src.user_id;
            doc.project_id = cur_src.project_id;
            doc.history_id = cur_src.history_id;
            doc.deleted = cur_src.deleted;
          }
        }
        this.sourceFile = doc;
        //set the value of the form to the name of the file
        this.sourceFormValue = file.name;
        //remove animation classes
        this.projectForm.controls.sourceValue.setValue(file.name);
      },
      error: err => console.error("Error parsing new source document. Error:" + err)
    })
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
    this.showOverlay();
    const fileList = this.summaryInput.nativeElement.files;
    const summaryFiles: File[] = fileList ? Array.from(fileList) : [];

    if (summaryFiles.length === 0){
      this.hideOverlay();
      return; //drop the function without raising errors
    }

    const requests = summaryFiles.map(file =>
      this.nlp.parseRawIUCollection(file, 'summary')
    );

    forkJoin(requests).pipe(
      finalize(() => {
        //Always run this at the end
        this.hideOverlay();
      })
    ).subscribe({
      next: (docs) => {
        docs.forEach(doc => {
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
    if (this.cur_proj === null) {
      throw new Error("Trying to delete null project.")
    }
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
  removeSummary(summary: IUCollection): void {
    this.summaryFiles.delete(summary);
    if (this.summaryAddQueue.has(summary)) {
      this.summaryAddQueue.delete(summary);
    } else {
      this.summaryRemovalQueue.add(summary);
    }
  }

  // overlay controls
  @ViewChild("overlayOrigin") overlayOrigin!: ElementRef;
  overlayRef: ProgressRef | null = null;
  showOverlay() {
    this.overlayRef = this.overlayService.showOverlay(this.overlayOrigin, UploadOverlayComponent);
  }
  hideOverlay() {
    this.overlayService.detach(this.overlayRef);
  }

  onSubmit(): void {
    if (this.cur_proj === null) {
      throw new Error("Something went wrong. Project is missing.")
    }
    if (this.sourceFile === null) {
      throw new Error("Something went wrong. Source file is missing.")
    }
    console.log("Saving project")
    this.showOverlay()
    this.storage.updateCurProject(
      this.cur_proj,
      true,
      true,
      this.sourceFile,
      this.summaryAddQueue,
      this.summaryRemovalQueue
    ).pipe(
      finalize(() => {
        //Always run this at the end
        this.hideOverlay();
      })
    ).subscribe({
      complete: () => {
        this.ngOnInit();
      },
      error: err => console.error("Error while updating the project: " + err)
    })
  }
}
