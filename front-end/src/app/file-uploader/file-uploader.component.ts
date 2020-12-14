import { Component, OnInit, EventEmitter, Input, Output} from '@angular/core';

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

  onUpload(file_form): void {
    console.log(file_form.empty)
    if(!file_form.empty){
      //console.log(file_form.value._files[0])
      const fileReader = new FileReader();
      fileReader.readAsText(file_form.value._files[0], "UTF-8");
      fileReader.onload = () => {
        this.fileUpload.emit(JSON.parse(fileReader.result as string));
      }
      fileReader.onerror = (error) => {
        console.log(error);
      }

    }
  }

}
