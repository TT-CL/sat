import { Content } from '@angular/compiler/src/render3/r3_ast';
import { Component, ContentChildren, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { IdeaUnit, IUCollection, Segment } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

import { FormControl } from '@angular/forms';
import { runInThisContext } from 'vm';

@Component({
  selector: 'app-source-editor',
  templateUrl: './source-editor.component.html',
  styleUrls: ['./source-editor.component.sass'],
  encapsulation: ViewEncapsulation.None, //required for css to work on innerHTML
})
export class SourceEditorComponent implements OnInit {

  doc: IUCollection = null;

  constructor(private storage: StorageService) {
      storage.getWorkSource().subscribe((source)=>{
        this.doc = source;
        //console.log("retrieving source");
        this.resetEditor();
      });
  }

  obtainPreHTML(doc: IUCollection){
    let data: string = "";
    doc.segs.forEach(seg=>{
      data += seg.getText(doc) + "<br>"
    });
    return data;
  }

  editedFlag: boolean = false;
  newSegments: Array<string>;
  editor = new FormControl();

  ngOnInit(): void {
  }

  @ViewChild("preEditor") preEditor;

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

  segClick(): void{

  }
}