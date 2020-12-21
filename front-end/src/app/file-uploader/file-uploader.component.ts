import { Component, OnInit, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.sass']
})
export class FileUploaderComponent implements OnInit {

  constructor() { }
  @Input() mode : string = "source";

  ngOnInit(): void {
  }

  @Output() fileUpload = new EventEmitter<Object>();

  @ViewChild('fileInput')
  fileInput;

  file: File | null = null;

  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.file = files[0];
  }

  uploadClick():void {
    console.log(this.file);
  }

  loadJson(): void {
    if(this.file){
      if(this.file.type == "application/json"){
        console.log(this.file);
        //console.log(file_form.value._files[0])
        const fileReader = new FileReader();
        fileReader.readAsText(this.file, "UTF-8");
        fileReader.onload = () => {
          this.fileUpload.emit(JSON.parse(fileReader.result as string));
        }
        fileReader.onerror = (error) => {
          console.log(error);
        }
      }
    }
  }
}
