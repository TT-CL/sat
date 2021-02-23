import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges} from '@angular/core';

import { Word, Segment, IdeaUnit, IUCollection, Project } from '../../data-objects';

import { StorageService } from '../../storage.service';

import { ActivatedRoute, Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-dash-toolbar',
  templateUrl: './dash-toolbar.component.html',
  styleUrls: ['./dash-toolbar.component.sass']
})
export class DashToolbarComponent implements OnInit {

  constructor(
    private storage : StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    router.events.subscribe((event) =>{
      if(event instanceof NavigationEnd){
        let proj = storage.cur_project_support;
        if (proj) this.linkable = proj.hasSummaries();

        let view: string = route.snapshot.params["view"];
        this.colorButtons(view);
      }
    });
  }

  ngOnInit(): void {
  }

  linkable: boolean;

  tv_color = "accent";
  iv_color = "primary";
  etv_color = "primary";
  liv_color = "primary";
  dow_color = "primary";

  colorButtons(view: string){
    //console.log("coloring");
    switch (view) {
      case "reader":
        this.tv_color = "accent";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "primary";
        this.dow_color = "primary";
        break;
      case "iu":
        this.tv_color = "primary";
        this.iv_color = "accent";
        this.etv_color = "primary";
        this.liv_color = "primary";
        this.dow_color = "primary";
        break;
      case "edit":
        this.tv_color = "primary";
        this.iv_color = "primary";
        this.etv_color = "accent";
        this.liv_color = "primary";
        this.dow_color = "primary";
        break;
      case "link":
        this.tv_color = "primary";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "accent";
        this.dow_color = "primary";
        break;
      case "download":
        this.tv_color = "primary";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "primary";
        this.dow_color = "accent";
        break;
      default:
        this.tv_color = "accent";
        this.iv_color = "primary";
        this.etv_color = "primary";
        this.liv_color = "primary";
        this.dow_color = "primary";
        break;
    }
  }
}
