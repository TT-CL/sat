import { Component, ContentChildren, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';

import { IdeaUnit, IUCollection, Project, Segment } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { BackEndService } from '../../back-end.service';

import { FormControl } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-summary-editor',
  templateUrl: './summary-editor.component.html',
  styleUrls: ['./summary-editor.component.sass'],
  encapsulation: ViewEncapsulation.None, //required for css to work on innerHTML
})
export class SummaryEditorComponent implements OnInit {
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
    storage.getWorkSummary().subscribe((summary) => {
      this.doc = summary;
      this.newDoc = summary;
      //console.log("retrieving summary");
      this.resetEditor();
      this.selectedIUs.clear();
      this.connectedSegsMaxIdx = 1; //start from 1
      this.disconnectedSegsMaxIdx = 1;  //start from 1
    });
  }

  ngOnInit(): void {
  }

  stripSpanStyles(node) {
    if (node.tagName == "SPAN") {
      // remove styles
      node.removeAttribute("style");
    }
    //recursively traverse the child tree
    for (let child of node.childNodes) {
      this.stripSpanStyles(child);
    }
  }

  parseEditedSegments(): Array<string> {
    let res = [];
    for (let child of this.preEditor.nativeElement.childNodes) {
      if (child.tagName == "DIV") {
        let temp = child.innerText.trim();
        if (temp && temp != "") {
          res.push(child.innerText);
        }
      }
    }
    return res;
  }

  preInput(evt) {
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

  resetEditor() {
    this.editedFlag = false;
    this.preEdited = false;
    let html = this.doc.getPreHtml();
    this.editor.setValue(html);
    delete this.newSegments;
  }

  retrieveTokenizedSegs(save_to_storage = false) {
    //console.log(this.newSegments);
    this.backend.getTokenizedSegs(
      this.doc.doc_name, this.doc.doc_type, this.newSegments
    ).subscribe(event => {
      if (event.type == HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        //console.log('${fName} is ${percentDone}% loaded.');
      } else if (event instanceof HttpResponse) {
        let new_doc = new IUCollection();
        //console.log(event.body);
        new_doc.readDocument(event.body)
        console.log(new_doc)
        this.retrievedSegsFlag = true;
        this.preEdited = false;
        this.newDoc = new_doc
        if (save_to_storage) {
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
    if ($event.index == 1) { // only do this if we move to connected Segs
      if (this.preEdited) {
        // only upload if I have some edits
        if (this.retrievedSegsFlag == false && this.editedFlag == true) {
          // do not tokenize the segments again if they were already tokenized
          this.retrieveTokenizedSegs();
        }
      }
    }
  }

  segClick(seg: Segment): void {
    if (this.selectedIUs.has(seg.iu)) {
      this.selectedIUs.delete(seg.iu)
    } else {
      this.selectedIUs.add(seg.iu);
    }
  }

  clearSelectedSegs() {
    this.discEdited = false;
    this.selectedIUs.clear();
  }

  connectSegs() {
    this.editedFlag = true;
    this.discEdited = true;

    //compute
    this.newDoc.connectSegs(this.selectedIUs);
    //console.log(this.newDoc);

    this.clearSelectedSegs();
  }

  disconnectSegs() {
    this.editedFlag = true;
    this.discEdited = true;

    //compute
    this.newDoc.disconnectSegs(this.selectedIUs);

    //console.log(this.newDoc);
    this.clearSelectedSegs();
  }

  saveEdits(skip_check = false) {
    if (this.preEdited && !skip_check) {
      this.retrieveTokenizedSegs(true);
    } else {

      //compute
      this.newDoc.continuityCheck();
      // keep old sents;
      this.newDoc.sents = this.doc.sents;
      this.storage.clearSimilarities(this.doc.doc_name);
      this.storage.updateWorkSummary(this.newDoc);
    }
  }
}
