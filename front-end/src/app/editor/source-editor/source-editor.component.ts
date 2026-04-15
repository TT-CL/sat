import { Component, ContentChildren, OnInit, ViewChild, ViewChildren, ViewEncapsulation, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';

import { IdeaUnit, IUCollection, Project, Segment } from '../../objects/objects.module';

import { StorageService } from '../../storage.service';

import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTab, MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SegEditQueue } from 'src/app/objects/seg-edit-queue';
import { NLPService } from 'src/app/nlp.service';

@Component({
    selector: 'app-source-editor',
    templateUrl: './source-editor.component.html',
    styleUrls: ['./source-editor.component.sass'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
      CommonModule,
      MatTabsModule,
      MatDividerModule,
      MatChipsModule,
      MatButtonModule,
      MatIconModule,
      ReactiveFormsModule
    ]
})
export class SourceEditorComponent implements AfterViewInit {

  // data structs
  doc: IUCollection = null;
  newDoc: IUCollection;
  proj : Project;

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
    private nlp: NLPService
  ) {
    storage.getCurProject().subscribe((proj)=>{
      this.proj = proj
      this.doc = this.cloneIuCollection(proj.sourceDoc)
      this.newDoc = this.cloneIuCollection(proj.sourceDoc)
      //console.log("retrieved source document");
      //console.log(this.newDoc)
    })
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

  preInput(evt){
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

  resetEditor(){
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

  tabChanged($event) {
    this.resetEditor()
  }

  segClick(seg: Segment):void{
    if(this.selectedIUs.has(seg.iu)){
      this.selectedIUs.delete(seg.iu)
    }else{
      this.selectedIUs.add(seg.iu);
    }
  }

  clearSelectedSegs(){
    //this.discEdited = false;
    this.selectedIUs.clear();
  }

  connectSegs(){
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

  private storeEdits(){
    //compute
    this.newDoc.continuityCheck();
    // keep old sents;
    this.newDoc.sents = this.doc.sents;
    //this.storage.updateWorkSource(this.newDoc);
    // copy over db data
    this.newDoc._id = this.doc._id;
    this.newDoc.user_id = this.doc.user_id;
    this.newDoc.project_id = this.doc.project_id;
    this.newDoc.history_id = this.doc.history_id;
    this.newDoc.deleted = this.doc.deleted;
    console.log("store_edits")
    console.log(this.newDoc)

    this.proj.sourceDoc = this.newDoc
    this.proj.purgeProjectLinks();
    this.storage.clearAllSimilarities();
    this.storage.updateCurProject(this.proj, true).subscribe({
      error: err => console.error('Silent project update failed:', err),
      complete: () =>{
        this.doc = this.cloneIuCollection(this.newDoc);
        this.editedFlag = false;
      }
    });
  }
  
  saveEdits(){

    if (this.editedFlag && !this.discEdited) {
      this.nlp.retrieveTokenizedSegs(this.doc, this.newSegments).subscribe({
        next: (new_doc: IUCollection) => {
          this.newDoc = new_doc;
          this.newDoc.applySegEditQueue(this.segEditQueue);
          this.storeEdits();
        }
      });
    } else {
      this.storeEdits();
   
    }
  }
}
