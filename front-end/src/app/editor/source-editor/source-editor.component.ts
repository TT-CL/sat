import { Content } from '@angular/compiler/src/render3/r3_ast';
import { Component, ContentChildren, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { IdeaUnit, IUCollection, Segment } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { BackEndService } from '../../back-end.service';

import { FormControl } from '@angular/forms';
import { runInThisContext } from 'vm';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-source-editor',
  templateUrl: './source-editor.component.html',
  styleUrls: ['./source-editor.component.sass'],
  encapsulation: ViewEncapsulation.None, //required for css to work on innerHTML
})
export class SourceEditorComponent implements OnInit {

  doc: IUCollection = null;

  newDoc: IUCollection;
  editedFlag: boolean = false;
  retrievedSegsFlag: boolean = false;
  newSegments: Array<string>;
  editor = new FormControl();

  @ViewChild("preEditor") preEditor;

  constructor(
    private storage: StorageService,
    private backend: BackEndService,
    ) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
        this.newDoc = source;
        //console.log("retrieving source");
        this.resetEditor();
      });
  }

  ngOnInit(): void {
  }

  obtainPreHTML(doc: IUCollection){
    let data: string = "";
    doc.segs.forEach(seg=>{
      data += seg.getText(doc) + "<br>"
    });
    return data;
  }

  stripSpanStyles(node){
    if( node.tagName == "SPAN" ){
      // remove styles
      node.removeAttribute("style");
    }
    //recursively traverse the child tree
    for( let child of node.childNodes){
      this.stripSpanStyles(child);
    }
  }

  parseEditedSegments(): Array<string>{
    let res = [];
    for (let child of this.preEditor.nativeElement.childNodes){
      if(child.tagName == "DIV"){
        let temp = child.innerText.trim();
        if (temp && temp != ""){
          res.push(child.innerText);
        }
      }
    }
    return res;
  }

  preInput(evt){
    //set the edited flag to true
    this.editedFlag = true;
    // set the tokenized flag to false -> even if they were retrieve before,
    // I need to retrieve them again after any kind of edit
    this.retrievedSegsFlag = false;
    // remove span styles to avoid inconsistent colors
    this.stripSpanStyles(this.preEditor.nativeElement);
    // parse the segments and update the structure
    this.newSegments = this.parseEditedSegments();
  }

  resetEditor(){
    this.editedFlag = false;
    let html = ""
    this.doc.segs.forEach(seg =>{
      //each segment goes in a div.
      //divs are zebra colored via css
      html += "<div>" + seg.getText(this.doc) + "</div>"
    });
    this.editor.setValue(html);
  }

  retrieveTokenizedSegs(){
    console.log(this.newSegments);
    this.backend.getTokenizedSegs(
      this.doc.doc_type, this.doc.doc_name, this.newSegments
      ).subscribe(event => {
      if (event.type == HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        //console.log('${fName} is ${percentDone}% loaded.');
      } else if (event instanceof HttpResponse) {
        let new_doc = new IUCollection();
        //console.log(event.body);
        new_doc.readDocument(event.body)
        this.retrievedSegsFlag = true;
        this.newDoc = new_doc
      }
    },
    (err) => {
      console.log("Error parsing manually edited segments");
    }, () => {
      console.log("Manual edits parsed successuflly");
      //this.uploadComplete();
    });
  }

  tabChanged($event) {
    // do not tokenize the segments again if they were already tokenized
    if(this.retrievedSegsFlag == false && this.editedFlag == true){
      this.retrieveTokenizedSegs();
    }
  }

  saveEdits(){
    this.retrieveTokenizedSegs();
  }
}