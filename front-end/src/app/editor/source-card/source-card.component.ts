import { Component, OnInit } from '@angular/core';

import { IUCollection } from '../../data-objects';

import { StorageService } from '../../storage.service';

import { ComponentPortal, Portal } from '@angular/cdk/portal';

import {BehaviorSubject, Observable} from 'rxjs';

import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { SourceReaderComponent } from '../source-reader/source-reader.component';
import { SourceIuComponent } from '../source-iu/source-iu.component';

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
  }

  ngOnInit(): void {
    //Initialize the portal components
    this.sourceReaderPortal = new ComponentPortal(SourceReaderComponent);
    this.sourceIuPortal = new ComponentPortal(SourceIuComponent);

    //the following will be called each time we switch view from the toolbar
    this.view.asObservable().subscribe((view)=>{
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
          default: {
            this.portalOutlet = this.sourceReaderPortal;
            break;
          }
      }
    });
  }

  portalOutlet: Portal<any>;

  view : BehaviorSubject<string>;
  sourceReaderPortal : ComponentPortal<SourceReaderComponent>;
  sourceIuPortal : ComponentPortal<SourceIuComponent>;

  doc: IUCollection = null;
}
