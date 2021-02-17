import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.sass']
})
export class NewProjectComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) { }

  projectForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: [''],
    source: ['', Validators.required],
  });

  ngOnInit(): void {
  }

  sourceFile: File | null = null;
  sourceFormValue : string = "";
  sourceFormFieldClass : string = "";

  summaryFiles = new Set<File>();

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

  onSubmit(): void{
    // Gather the data -> if I am able to submit then I passed the validators
    let title = this.projectForm.value.title
    let description = this.projectForm.value.description;
    let source = this.sourceFile
    let summaries = this.summaryFiles
    console.log(title);
    console.log(description);
    console.log(source);
    console.log(summaries);

    // do stuff
  }
}
