import { Component, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Observable, of} from 'rxjs';

import { OverlayService } from '../../overlay.service';
import { UploadOverlayComponent } from '../upload-overlay/upload-overlay.component';

import { IUCollection, Project } from '../../objects/objects.module';

import { BackEndService } from '../../back-end.service';
import { StorageService } from '../../storage.service';

import { HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.sass']
})
export class NewProjectComponent {

  constructor(
    private formBuilder: FormBuilder,
    private overlayService: OverlayService,
    private textService : BackEndService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute) { }

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
  parsedSummaries: IUCollection[] = [];

  docNumber: number;
  progress: number;

  //catch the file input elements
  @ViewChild('sourceInput')
  sourceInput;

  @ViewChild('summaryInput')
  summaryInput;

  //show file selection window
  onClickSourceForm(): void {
    this.sourceInput.nativeElement.click();
    //add animation classes, so that something happens when clicking even though the element is readonly
    this.sourceFormFieldClass = "mat-form-field-should-float mat-focused";
    // I have no way to check wheter cancel was pressed in the filepicker, so I have to remove the animation class after a time to ensure visual consistency
    setTimeout(() => this.removeFocusSourceForm(), 5000);
  }

  removeFocusSourceForm():void{
    this.sourceFormFieldClass = "";
  }

  //save the source file
  onChangeSourceInput(): void {
    const files: { [key: string]: File } = this.sourceInput.nativeElement.files;
    this.sourceFormFieldClass = "";
    if (files[0]){
      this.sourceFile = files[0];
      //set the value of the form to the name of the file
      this.sourceFormValue = files[0].name;
      //remove animation classes
    }
  }

  removesourceFile(): void {
    this.sourceFile = null;
    this.sourceFormValue = "";
    this.projectForm.controls.source.reset();
  }

  newSummary(): void {
    this.summaryInput.nativeElement.click();
  }

  //save the summary file
  onChangeSummaryInput(): void {
    const summary_files: { [key: string]: File } = this.summaryInput.nativeElement.files;
    //add the files to the array
    for (let key of Object.keys(summary_files)){
      this.summaryFiles.add(summary_files[key]);
    }
  }

  //function to remove a summary from the list
  removeSummary(summary: File): void{
    this.summaryFiles.delete(summary);
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

  loadTxt(file: File, mode: string): void{
    let fName = file.name;
    let doc = new IUCollection();
    console.log("Uploading " + fName);
    if(file.type == "text/plain"){
      this.textService.getLabelledText(mode, file).subscribe(
      event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          //console.log('${fName} is ${percentDone}% loaded.');
        } else if (event instanceof HttpResponse) {
          let doc = new IUCollection();
          doc.readDocument(event.body);
          if (mode == "source"){
            this.parsedSource = doc;
          }else if (mode == "summary"){
            this.parsedSummaries.push(doc);
          }
        }
      },
      (err) => {
        console.log("Error uploading " + fName + " :", err);
      }, () => {
        console.log(fName + " uploaded successfully");
        this.progress = this.progress + 1;
        if(this.progress == this.docNumber){
            this.uploadComplete();
        }
      });
    }
  }

  uploadComplete(): void {
    //Upload is complete
    this.hideOverlay();
    console.log("Upload complete successfully");
    let title = this.projectForm.value.title
    let description = this.projectForm.value.description;
    let proj = new Project();
    proj.name = title;
    proj.sourceDoc = this.parsedSource;
    proj.creation_time = new Date();
    proj.last_edit = proj.creation_time;
    if (description && description != ""){
      proj.description = description;
    }
    if (this.parsedSummaries.length > 0){
      proj.summaryDocs = this.parsedSummaries;
    }
    this.storage.addProject(proj);
    //console.log(this.storage);
    this.redirectOut();
  }

  redirectOut() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onSubmit(): void{
    let self = this;
    this.showOverlay();
    // Gather the data -> if I am able to submit then I passed the validators
    let source = this.sourceFile;
    let summaries = this.summaryFiles;

    this.docNumber = summaries.size + 1;
    this.progress = 0;

    this.loadTxt(source, "source");
    for (let summary of summaries){
      this.loadTxt(summary, "summary");
    }
  }
}
