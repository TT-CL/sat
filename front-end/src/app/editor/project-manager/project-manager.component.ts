import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackEndService } from 'src/app/back-end.service';
import { OverlayService } from 'src/app/overlay.service';
import { UploadOverlayComponent } from 'src/app/user-area/upload-overlay/upload-overlay.component';

import { IUCollection, Project } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

type FileOrDoc = File | IUCollection;


@Component({
  selector: 'app-project-manager',
  templateUrl: './project-manager.component.html',
  styleUrls: ['./project-manager.component.sass']
})
export class ProjectManagerComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private overlayService: OverlayService,
    private textService: BackEndService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.storage.getCurProject().subscribe((proj: Project) => {
      console.log(proj);
      this.cur_proj = proj;
      this.projTitle = proj.name;
      //this.projDescription = proj.description;
      this.sourceFile = proj.sourceDoc;
      this.summaryFiles = new Set(proj.summaryDocs);
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

  cur_proj : Project = null;
  projDescription: string = null;
  projTitle: string = null;

  changedFlag: boolean = false;

  projectForm : FormGroup = null;

  sourceFile: FileOrDoc | null = null;
  sourceFormValue: string = "";
  sourceFormFieldClass: string = "";

  summaryFiles = new Set<FileOrDoc>();
  summaryRemovalQueue : IUCollection[] = [];

  parsedSource: IUCollection = null;
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
      this.projectForm.controls.sourceValue.setValue(files[0].name);
    }
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
    const summary_files: { [key: string]: File } = this.summaryInput.nativeElement.files;
    //add the files to the array
    for (let key of Object.keys(summary_files)){
      this.summaryFiles.add(summary_files[key]);
    }
  }

  //function to remove a summary from the list
  removeSummary(summary: FileOrDoc): void{
    this.summaryFiles.delete(summary);
    if (summary instanceof IUCollection){
      this.summaryRemovalQueue.push(summary);
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
    console.log("Upload completed successfully");
    this.cur_proj.name = this.projectForm.value.title
    this.cur_proj.description = this.projectForm.value.description;
    if(this.parsedSource){
      this.cur_proj.sourceDoc = this.parsedSource;
      console.log("changed source file");
    }
    if(this.summaryRemovalQueue.length > 0 ){
      for(let summary of this.summaryRemovalQueue){
        let index = this.cur_proj.summaryDocs.indexOf(summary);
        this.cur_proj.summaryDocs.splice(index, 1);
      }
    }

    if(this.parsedSummaries.length > 0){
      if(this.cur_proj.summaryDocs){
        //If I already have some summaries then concat
        this.cur_proj.summaryDocs = this.cur_proj.summaryDocs.concat(
          this.parsedSummaries);
      }else{
        //If I don't have summaries, then include them
        this.cur_proj.summaryDocs = this.parsedSummaries;
      }
    }

    this.storage.updateCurProject(this.cur_proj);
    console.log(this.storage);
  }

  nonFileValuesChanged(): boolean {
    return !(
      this.cur_proj.name == this.projectForm.value.title &&
      this.cur_proj.description == this.projectForm.value.description &&
      this.summaryRemovalQueue.length == 0
    );
  }

  onSubmit(): void{
    console.log("here")
    let self = this;
    // Gather the data -> if I am able to submit then I passed the validators
    //set the progress tracker values
    this.docNumber = 0;
    this.progress = 0;

    for (let summary of this.summaryFiles) {
      if (summary instanceof File) {
        this.docNumber ++
      }
    }
    if (this.sourceFile instanceof File) {
      this.docNumber ++
    }

    if(this.docNumber != 0){
      this.showOverlay();
      //process only new files
      if (this.sourceFile instanceof File) {
        let source = this.sourceFile;
        this.loadTxt(source, "source");
      }
      for (let summary of this.summaryFiles) {
        if (summary instanceof File) {
          this.loadTxt(summary, "summary");
        }
      }
    }else if (this.nonFileValuesChanged()){
      this.uploadComplete();
    }    
  }
}
