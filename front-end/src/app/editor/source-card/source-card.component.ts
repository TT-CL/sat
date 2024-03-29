import { Component, OnInit } from '@angular/core';

import { IUCollection } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

import { ComponentPortal, Portal } from '@angular/cdk/portal';

import {BehaviorSubject, Observable} from 'rxjs';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { SourceReaderComponent } from '../source-reader/source-reader.component';
import { SourceIuComponent } from '../source-iu/source-iu.component';
import { SourceLinkComponent } from '../source-link/source-link.component';
import { SourceEditorComponent } from '../source-editor/source-editor.component';

@Component({
  selector: 'app-source-card',
  templateUrl: './source-card.component.html',
  styleUrls: ['./source-card.component.sass']
})
export class SourceCardComponent implements OnInit {

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
      });

      //initialize the view subject to allow observer behaviour
      this.view = new BehaviorSubject<string>(null);

      //this is called each time we change the url
      router.events.subscribe((event) =>{
        if(event instanceof NavigationEnd){
          this.view.next(route.snapshot.params["view"]);
        }
      });

      //Initialize the portal components
      this.sourceReaderPortal = new ComponentPortal(SourceReaderComponent);
      this.sourceIuPortal = new ComponentPortal(SourceIuComponent);
      this.sourceLinkPortal = new ComponentPortal(SourceLinkComponent);
      this.sourceEditorPortal = new ComponentPortal(SourceEditorComponent);
  }
  ngOnInit(): void {
    //the following will be called each time we switch view from the toolbar
    this.view.asObservable().subscribe((view) => {
      this.handleViewChange(view);
    });

    //forcibly trigger route update on init
    this.view.next(this.route.snapshot.params["view"]);
  }

  handleViewChange(view){
    //console.log("observed view: "+view);
    switch (view) {
      case "reader": {
        this.portalOutlet = this.sourceReaderPortal;
        break;
      }
      case "iu": {
        this.portalOutlet = this.sourceIuPortal;
        break;
      }
      case "link": {
        this.portalOutlet = this.sourceLinkPortal;
        break;
      }
      case "edit": {
        this.portalOutlet = this.sourceEditorPortal;
        break;
      }
      default: {
        this.portalOutlet = this.sourceReaderPortal;
        break;
      }
    }
  }

  portalOutlet: Portal<any>;

  view : BehaviorSubject<string>;
  sourceReaderPortal : ComponentPortal<SourceReaderComponent>;
  sourceIuPortal : ComponentPortal<SourceIuComponent>;
  sourceLinkPortal : ComponentPortal<SourceLinkComponent>;
  sourceEditorPortal : ComponentPortal<SourceEditorComponent>;

  doc: IUCollection = null;
}
