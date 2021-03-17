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

  // data structs
  doc: IUCollection = null;
  newDoc: IUCollection;

  editedFlag: boolean = false;
  // alter segments
  preEdited: boolean = false;
  retrievedSegsFlag: boolean = false;
  newSegments: Array<string>;
  editor = new FormControl();

  //connect segments
  discEdited = false;
  selectedIUs: Set<string> = new Set(); 
  connectedSegsMaxIdx: number;
  disconnectedSegsMaxIdx: number;

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
        this.selectedIUs.clear();
        this.connectedSegsMaxIdx = 1; //start from 1
        this.disconnectedSegsMaxIdx = 1;  //start from 1
      });
  }

  ngOnInit(): void {
  }

  obtainPreHTML(doc: IUCollection){
    let data: string = "";
    for( let key in doc.segs){
      let seg = doc.segs[key];
      data += seg.getText(doc) + "<br>"
    };
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
    this.preEdited = true;
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
    this.preEdited = false;
    let html = ""
    for (let idx in this.doc.segs){
      let seg = this.doc.segs[idx];
      //each segment goes in a div.
      //divs are zebra colored via css
      html += "<div>" + seg.getText(this.doc) + "</div>"
    };
    this.editor.setValue(html);
    delete this.newSegments
  }

  retrieveTokenizedSegs(save_to_storage = false){
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
        this.preEdited = false;
        this.newDoc = new_doc
        if(save_to_storage){
          // recall save edits, but this time skip the checks and go straight
          // to the storage section
          this.saveEdits(true);
        }
      }
    },
    (err) => {
      console.log("Error parsing manually edited segments");
    }, () => {
      console.log("Manual edits parsed successuflly");
    });
  }

  tabChanged($event) {
    if ($event.index == 1){ // only do this if we move to connected Segs
      if (this.preEdited){
      // only upload if I have some edits
          if (this.retrievedSegsFlag == false && this.editedFlag == true) {
          // do not tokenize the segments again if they were already tokenized
            this.retrieveTokenizedSegs();
        }
      }
    }
  }

  segClick(seg: Segment):void{
    if(this.selectedIUs.has(seg.iu)){
      this.selectedIUs.delete(seg.iu)
    }else{
      this.selectedIUs.add(seg.iu);
    }
  }

  clearSelectedSegs(){
    this.discEdited = false;
    this.selectedIUs.clear();
  }

  connectSegs(){
    this.editedFlag = true;
    this.discEdited = true;
    let iuLabel = "c"+ this.connectedSegsMaxIdx;
    this.connectedSegsMaxIdx +=1;
    // add the new IU
    let newIu = new IdeaUnit(iuLabel, true);
    for (let idx in this.newDoc.segs){
      let seg = this.newDoc.segs[idx];
      if(this.selectedIUs.has(seg.iu)){
        delete this.newDoc.ius[seg.iu];
        seg.iu = iuLabel;
        newIu.childSegs[seg.index] = seg.index;
      }
    };
    this.newDoc.ius[iuLabel] = newIu;
    console.log(this.newDoc);
    this.clearSelectedSegs();
  }

  disconnectSegs(){
    this.editedFlag = true;
    this.discEdited = true;
    this.selectedIUs.forEach(sel_iu_label =>{
      let sel_iu = this.newDoc.ius[sel_iu_label];
      if(sel_iu.disc){
        for(let key in sel_iu.childSegs){
          let seg_idx = sel_iu.childSegs[key];
          // find each segment
          let child_seg = this.newDoc.segs[seg_idx]
          // create a new IU for each segment
          let iuLabel = "d" + this.disconnectedSegsMaxIdx;
          this.disconnectedSegsMaxIdx += 1;
          let newIu = new IdeaUnit(iuLabel, false);
          newIu.childSegs[child_seg.index] = child_seg.index;
          // store values
          this.newDoc.ius[iuLabel] = newIu;
          child_seg.iu = iuLabel;
        }
        //remove the old iu from memory
        delete this.newDoc.ius[sel_iu_label];
      }
    });
    console.log(this.newDoc);
    this.clearSelectedSegs();
  }

  saveEdits(skip_check = false){
    if (this.preEdited && !skip_check){
      this.retrieveTokenizedSegs(true);
    }else{
    this.newDoc.continuityCheck();
    // keep old sents;
    this.newDoc.sents = this.doc.sents;
    this.storage.updateWorkSource(this.newDoc);
    }
  }
}
