import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges} from '@angular/core';

import { Word, Segment, IdeaUnit, IUCollection } from '../data-objects';

@Component({
  selector: 'app-dash-toolbar',
  templateUrl: './dash-toolbar.component.html',
  styleUrls: ['./dash-toolbar.component.sass']
})
export class DashToolbarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  @Input() link_disabled_flag: boolean = true;

  @Output() toolbarClick = new EventEmitter<string> ();

  selectedView: String = "textView";
  tv_color = "accent";
  iv_color = "primary";
  etv_color = "primary";
  liv_color = "primary";

  clickToolbar(view : string){
    this.selectedView = view;
    switch (view) {
      case "textView":
        this.tv_color = "accent";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "primary";
        break;
      case "iuView":
        this.tv_color = "primary";
        this.iv_color = "accent";
        this.etv_color = "primary";
        this.liv_color = "primary";
        break;
      case "editTextView":
        this.tv_color = "primary";
        this.iv_color = "primary";
        this.etv_color = "accent";
        this.liv_color = "primary";
        break;
      case "linkIuView":
        this.tv_color = "primary";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "accent";
        break;
      default:
        this.tv_color = "accent";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "primary";

        this.selectedView = "textView";
        break;
    }
    this.toolbarClick.emit(view);
    //console.log("click");
  }
}
