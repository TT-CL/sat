import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges} from '@angular/core';

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
        let view: string = route.snapshot.params["view"];
        this.colorButtons(view);
      }
    });
    storage.getCurProject().subscribe(proj =>{
      if (proj) this.linkable = proj.hasSummaries();
    });
  }

  ngOnInit(): void {
  }

  linkable: boolean;

  manage_project_color = "accent";
  text_view_color = "primary";
  iu_view_color = "primary";
  edit_text_view_color = "primary";
  link_iu_view_color = "primary";
  download_project_color = "primary";

  colorButtons(view: string){
    //console.log("coloring");
    switch (view) {
      case "manager":
        this.manage_project_color = "accent";
        this.text_view_color = "primary";
        this.iu_view_color = "primary";
        this.edit_text_view_color = "primary";
        this.link_iu_view_color = "primary";
        this.download_project_color = "primary";
        break;
      case "reader":
        this.manage_project_color = "primary";
        this.text_view_color = "accent";
        this.iu_view_color = "primary";
        this.edit_text_view_color = "primary";
        this.link_iu_view_color = "primary";
        this.download_project_color = "primary";
        break;
      case "iu":
        this.manage_project_color = "primary";
        this.text_view_color = "primary";
        this.iu_view_color = "accent";
        this.edit_text_view_color = "primary";
        this.link_iu_view_color = "primary";
        this.download_project_color = "primary";
        break;
      case "edit":
        this.manage_project_color = "primary";
        this.text_view_color = "primary";
        this.iu_view_color = "primary";
        this.edit_text_view_color = "accent";
        this.link_iu_view_color = "primary";
        this.download_project_color = "primary";
        break;
      case "link":
        this.manage_project_color = "primary";
        this.text_view_color = "primary";
        this.iu_view_color = "primary";
        this.edit_text_view_color = "primary";
        this.link_iu_view_color = "accent";
        this.download_project_color = "primary";
        break;
      case "download":
        this.manage_project_color = "primary";
        this.text_view_color = "primary";
        this.iu_view_color = "primary";
        this.edit_text_view_color = "primary";
        this.link_iu_view_color = "primary";
        this.download_project_color = "accent";
        break;
      default:
        this.manage_project_color = "accent";
        this.text_view_color = "primary";
        this.iu_view_color = "primary";
        this.edit_text_view_color = "primary";
        this.link_iu_view_color = "primary";
        this.download_project_color = "primary";
        break;
    }
  }
}
