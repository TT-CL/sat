import { Component, OnInit, EventEmitter, Input, Output, ViewChild} from '@angular/core';

import { TextService } from '../text.service';

import { HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.sass']
})

export class FileUploaderComponent implements OnInit {

  constructor( private textService : TextService ) { }
  @Input() mode : string = "source";

  ngOnInit(): void {
  }

  @Output() fileUpload = new EventEmitter<Object>();

  //initialize the file data structures
  file: File | null = null;
  backupFile: File | null = null;

  //catch the file input element
  @ViewChild('fileInput')
  fileInput;

  //catch the backup file input element
  @ViewChild('backupFileInput')
  backupFileInput;

  //proc the click action on the hidden input element
  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  //proc the click action on the hidden input element
  onClickBackupFileInputButton(): void {
    this.backupFileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.file = files[0];
  }

  onChangeBackupFileInput(): void {
    const files: { [key: string]: File } = this.backupFileInput.nativeElement.files;
    this.backupFile = files[0];
  }

  uploadClick():void {
    console.log(this.file);
  }

  loadJson(): void {
    if(this.backupFile){
      if(this.backupFile.type == "application/json"){
        //console.log(file_form.value._files[0])
        const fileReader = new FileReader();
        fileReader.readAsText(this.backupFile, "UTF-8");
        fileReader.onload = () => {
          this.fileUpload.emit(JSON.parse(fileReader.result as string));
        }
        fileReader.onerror = (error) => {
          console.log(error);
        }
      }
    }
  }

  loadTxt(): void{
    if(this.file){
      if(this.file.type == "text/plain"){
        this.textService.getLabelledText(this.mode, this.file).subscribe(
        event => {
          if (event.type == HttpEventType.UploadProgress) {
            const percentDone = Math.round(100 * event.loaded / event.total);
            console.log(`File is ${percentDone}% loaded.`);
          } else if (event instanceof HttpResponse) {
            console.log('File is completely loaded!');
            this.fileUpload.emit(event.body);
          }
        },
        (err) => {
          console.log("Upload Error:", err);
        }, () => {
          console.log("Upload done");
        });
      }
    }
  }
}
