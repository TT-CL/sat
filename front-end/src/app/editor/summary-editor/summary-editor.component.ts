import { Component, ContentChildren, OnInit, ViewChild, ViewChildren, ViewEncapsulation, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';

import { IdeaUnit, IUCollection, Project, Segment } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';
import { BackEndService } from '../../back-end.service';

import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SegEditQueue } from 'src/app/objects/seg-edit-queue';

@Component({
    selector: 'app-summary-editor',
    templateUrl: './summary-editor.component.html',
    styleUrls: ['./summary-editor.component.sass'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
      CommonModule,
      MatTabsModule,
      MatChipsModule,
      MatButtonModule,
      MatIconModule,
      MatDividerModule,
      MatTooltipModule,
      ReactiveFormsModule
    ]
})
export class SummaryEditorComponent implements AfterViewInit {
  // data structs
  doc: IUCollection = null;
  newDoc: IUCollection;

  editedFlag: boolean = false;
  // alter segments
  retrievedSegsFlag: boolean = false;
  newSegments: Array<string>;

  //connect segments
  discEdited = false;
  selectedIUs: Set<string> = new Set();
  segEditQueue: SegEditQueue = new SegEditQueue();

  @ViewChild("preEditor") preEditor!: ElementRef<HTMLPreElement>;

  constructor(
    private storage: StorageService,
    private backend: BackEndService,
  ) {
    storage.getWorkSummary().subscribe((summary) => {
      this.doc = summary;
      this.newDoc = this.cloneIuCollection(summary);
      //console.log("retrieved summary");
      //console.log(this.newDoc)
    });
  }

  ngAfterViewInit(): void {
    this.resetEditor();
  }

  stripSpanStyles(node) {
    if (node['tagName'] == "SPAN") {
      // remove styles
      node['removeAttribute']("style");
    }
    //recursively traverse the child tree
    for (let child of node.childNodes) {
      this.stripSpanStyles(child);
    }
  }

  cloneIuCollection(doc: IUCollection): IUCollection {
    const clone = new IUCollection();
    clone.reconsolidate(JSON.parse(JSON.stringify(doc)));
    return clone
  }

  parseEditedSegments(): Array<string> {
    let res = [];
    if (this.preEditor.nativeElement) {
      const children = Array.from(this.preEditor.nativeElement.childNodes)
      for (let child of children) {
          if (child.nodeType === Node.ELEMENT_NODE && child.nodeName === 'DIV') {
              let temp = child['innerText'].trim();
              if (temp && temp != "") {
                  res.push(temp);
              }
          }
      }
    }
    console.log("parsed segments")
    console.log(res)
    return res;
  }

  preInput(evt) {
    //set the edited flag to true
    const target = evt.target as HTMLElement;
    if (this.preEditor.nativeElement) {
      this.editedFlag = true;
      // set the tokenized flag to false -> even if they were retrieve before,
      // I need to retrieve them again after any kind of edit
      this.retrievedSegsFlag = false;
      // remove span styles to avoid inconsistent colors
      this.stripSpanStyles(this.preEditor.nativeElement);
      // parse the segments and update the structure
      this.newSegments = this.parseEditedSegments();
    }
  }

  resetEditor() {
    this.editedFlag = false;
    this.discEdited = false;
    this.segEditQueue.resetQueue();
    this.selectedIUs.clear();
    // reset disc bubbles
    this.newDoc = this.cloneIuCollection(this.doc)
    // reset pre editor
    const html = this.doc.getPreHtml();
    //console.log(html)
    this.preEditor.nativeElement.innerHTML = html;
    this.newSegments = this.parseEditedSegments();
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
        this.newDoc = new_doc
        this.newDoc.applySegEditQueue(this.segEditQueue)
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
    this.resetEditor()
  }

  segClick(seg: Segment): void {
    if (this.selectedIUs.has(seg.iu)) {
      this.selectedIUs.delete(seg.iu)
    } else {
      this.selectedIUs.add(seg.iu);
    }
  }

  clearSelectedSegs() {
    //this.discEdited = false;
    this.selectedIUs.clear();
  }

  connectSegs() {
    this.editedFlag = true;
    this.discEdited = true;

    //compute
    this.newDoc.connectSegs(this.selectedIUs);
    this.segEditQueue.addSegConnection(this.selectedIUs)
    //console.log(this.newDoc);

    this.clearSelectedSegs();
  }

  disconnectSegs() {
    this.editedFlag = true;
    this.discEdited = true;

    //compute
    this.newDoc.disconnectSegs(this.selectedIUs);
    this.segEditQueue.addSegDisconnection(this.selectedIUs)

    //console.log(this.newDoc);
    this.clearSelectedSegs();
  }

  saveEdits(skip_check = false) {
    if (this.editedFlag && !skip_check && !this.discEdited) {
      //console.log("newSegments")
      //console.log(this.newSegments)
      //console.log("doc")
      //console.log(this.doc)
      //console.log("newDoc")
      //console.log(this.newDoc)
      this.retrieveTokenizedSegs(true);
    } else {

      //compute
      this.newDoc.continuityCheck();
      // keep old sents;
      this.newDoc.sents = this.doc.sents;
      // copy over db data
      this.newDoc._id = this.doc._id;
      this.newDoc.user_id = this.doc.user_id;
      this.newDoc.project_id = this.doc.project_id;
      this.newDoc.history_id = this.doc.history_id;
      this.newDoc.deleted = this.doc.deleted;

      this.storage.clearSimilarities(this.doc.doc_name);
      //console.log(this.newDoc)
      this.storage.updateWorkSummary(this.newDoc, true).subscribe({
        complete: () => {
          this.doc = this.cloneIuCollection(this.newDoc)
          this.editedFlag = false;
        },
        error: err => console.error(`Error updating summary "${this.newDoc.doc_name}":`, err),
      });
    }
  }
}
