import { Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-dash-toolbar',
  templateUrl: './dash-toolbar.component.html',
  styleUrls: ['./dash-toolbar.component.sass']
})
export class DashToolbarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Output() toolbarClick = new EventEmitter<string> ();

  selectedView: String = "textView";
  tv_color = "accent";
  iv_color = "primary";
  etv_color = "primary";

  clickToolbar(view : string){
    this.selectedView = view;
    switch (view) {
      case "textView":
        this.tv_color = "accent";
        this.iv_color = "primary";
        this.etv_color = "primary";
        break;
      case "iuView":
        this.tv_color = "primary";
        this.iv_color = "accent";
        this.etv_color = "primary";
        break;
      case "editTextView":
        this.tv_color = "primary";
        this.iv_color = "primary";
        this.etv_color = "accent";
        break;
      default:
        this.tv_color = "accent";
        this.iv_color = "primary";
        this.etv_color = "primary";

        this.selectedView = "textView";
        break;
    }
    this.toolbarClick.emit(view);
    console.log("click");
  }
}
