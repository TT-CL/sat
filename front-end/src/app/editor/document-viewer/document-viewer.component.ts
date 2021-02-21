import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ElementRef
} from '@angular/core';
import { ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { Word, Segment, IdeaUnit, IUCollection } from '../../data-objects';

import { TextService } from '../../text.service';
import { StorageService } from '../../storage.service';

import { OverlayService } from '../../overlay.service';
import { Overlay, PositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { SpinnerOverlayComponent } from '../spinner-overlay/spinner-overlay.component';

import { HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';


@Component({
  selector: 'document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.sass']
})
export class DocumentViewerComponent implements OnInit {

  constructor(
    private textService : TextService,
    private overlay: Overlay,
    private overlayService : OverlayService,
    private storage: StorageService){  }


  selected_iu : IdeaUnit = null;
  bubbleMode : string = "iu";
  @Input() doc : IUCollection = new IUCollection();
  @Input() other_doc : IUCollection = new IUCollection();
  similarities : Object = null;

  //alignment data
  @Input() iuLinkInput : IdeaUnit;
  @Output() iuLinkOutput = new EventEmitter<IdeaUnit> ();
  suggested_ius : IdeaUnit[] = [];

  //max_auto_iu_index : Number = 0;
  //max_man_iu_index : Number = 0;

  //viewSelector
  @Input() selectedView: string = "textView";


  ngOnInit(){
    //this.getText();
  }

  // !-- PRINTERS --!
  punctuation : string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

  //procced when the file changes (file upload)
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName == "selectedView"){
        // clear the selections every time I change a view
        this.toggleIuSelect();
        // clear similarities predictions when changing views
        this.similarities = null;
        // hide loading spinner if shown
        this.hideSpinner();
        if (this.selectedView == "linkIuView" && this.doc.doc_type == "source"){
          // entering IU link mode
          // fetch suggested links
          this.showSpinner();
          this.textService.getSimPredictions(this.doc, this.other_doc).subscribe(
          event => {
            if (event.type == HttpEventType.UploadProgress) {
              const percentDone = Math.round(100 * event.loaded / event.total);
              console.log(`Gathering similarities: ${percentDone}% done.`);
            } else if (event instanceof HttpResponse) {
              console.log('Similarities are ready!');
              this.similarities = event.body;
              console.log(this.similarities);
              this.hideSpinner();
            }
          },
          (err) => {
            console.log("Similarities Error:", err);
            this.hideSpinner();
          }, () => {
            console.log("Similarities calculated successfully");
            this.hideSpinner();
          });
        }
      }
      if (propName == "iuLinkInput"){
        if(this.iuLinkInput){
          console.log("received IU: " + this.iuLinkInput.getText(this.other_doc));
          console.log("linked IUs: ");
          console.log(this.iuLinkInput.linkedIus.length);
          console.log(this.iuLinkInput.linkedIus);
        }
        console.log("this.doc.doc_type");
        console.log(this.doc.doc_type);
        if(this.doc.doc_type == "source"){
          this.highlightIUs(this.iuLinkInput);
          this.toggleIuSelect();
        }else{
          console.log("linkinput and selectediu");
          console.log(this.iuLinkInput);
          console.log(this.selected_iu);
          if(this.iuLinkInput && this.selected_iu){
            console.log("unlinking");
            this.selected_iu.toggleIuLink(this.iuLinkInput);
          }
        }
      }
    }
  }

  // linking mode spinner
  @ViewChild("spinnerOrigin") spinnerOrigin: ElementRef;
  spinnerRef = null;
  showSpinner(){
    this.spinnerRef = this.overlayService.showOverlay(this.spinnerOrigin, SpinnerOverlayComponent);
  }
  hideSpinner(){
    this.overlayService.detach(this.spinnerRef);
  }

  /**
  getText(): void {
    this.textService.getText()
      .subscribe(text => this.text = text);
    console.log(this.text)
  }
  **/

  // !-- IU SEGMENTATION EDITOR --!
  allowIuEdit : boolean = false;
  allowIuCreation : boolean = false;

  bubbleClick(seg) : void {
    //console.log(seg);
    this.toggleIuSelect(this.doc.ius[seg.iu]);

    if(this.selected_iu){
      this.allowIuEdit = true;
    }else {
      this.allowIuEdit = false;
    }
  }

  linkClick(seg) : void {
    console.log("click");
    this.toggleIuSelect(this.doc.ius[seg.iu])
    if (this.doc.doc_type == "summary"){
      console.log("emitting iu from summary");
      this.iuLinkOutput.emit(new IdeaUnit());
      this.iuLinkOutput.emit(this.doc.ius[seg.iu]);
    }else if (this.doc.doc_type == "source"){
      this.iuLinkOutput.emit(new IdeaUnit());
      //if I have an input link
      if (this.iuLinkInput){
        this.doc.ius[seg.iu].toggleIuLink(this.iuLinkInput);
      }
      console.log("emitting iu from source");
      this.iuLinkOutput.emit(this.doc.ius[seg.iu]);
    }
  }

  toggleIuSelect(tog_iu: IdeaUnit = null) : void {
    if(tog_iu == null){
      //default case: deselect the IUS
      if (this.selected_iu){
        for (var seg of this.selected_iu.getChildren(this.doc)){
          seg['selected'] = false;
        }
        this.selected_iu = null;
      }
    }else{
      if (this.selected_iu){
        console.log("we have a pre selected iu");
        if (this.selected_iu.label != tog_iu.label){
          for (var seg of this.selected_iu.getChildren(this.doc)){
            seg['selected'] = false;
          }
          for (var seg of tog_iu.getChildren(this.doc)){
            seg['selected'] = true;
          }
          this.selected_iu = tog_iu;
        }else{
          for (var seg of tog_iu.getChildren(this.doc)){
            seg['selected'] = false;
          }
          this.selected_iu = null;
        }
      }else{
        console.log("no pre selected iu");
        for (var seg of tog_iu.getChildren(this.doc)){
          seg['selected'] = true;
        }
        this.selected_iu = tog_iu;
      }
    }
  }

  originalWordSet : Word[] = [];
  removeWordSet : Word[] = [];
  addWordSet : Word[] = [];

  engageEditIuMode() : void {
    console.log("Trying to edit Segment "+ this.selected_iu.label);
    this.bubbleMode = "word";
    for (let seg of this.selected_iu.getChildren(this.doc)){
      for (let word_idx of seg['words']){
        let word = this.doc.words[word_idx];
        word['color'] = 'accent';
        this.originalWordSet.push(word);
      }
    }
  }

  wordClick(word) : void {
    // I clicked on a word that was included in the original IU
    if(this.originalWordSet.includes(word)){
      // I already removed this word before
      if(this.removeWordSet.includes(word)){
        //add it again (remove it from the edit queue)
        this.removeWordSet.splice(word);
        word['color'] = 'accent';
      }else{
        //remove the word (add it to the edit queue)
        this.removeWordSet.push(word);
        word['color'] = 'warn';
      }
    }else{
      // I clicked on a word that was not in the original IU

      // I am clicking on a word that was not previously selected
      if(!this.addWordSet.includes(word)){
        //add it to the selection set
        this.addWordSet.push(word);
        word['color'] = 'lime-bubble';
      }else{
        //remove the word from the selection set
        this.addWordSet.splice(word);
        word['color'] = 'primary';
      }
    }
  }

  iuEditSave(): void{
    //save the edits
    for (var removeWord of this.removeWordSet){
      removeWord.remove(this.doc);
    }
    let iu = this.selected_iu;
    for (var word of this.addWordSet){
      iu.addWord(word, this.doc);
    }
    //return to IU mode
    this.iuEditCancel();
  }

  iuEditCancel(): void{
    //reset the words data structure
    for (let word of this.originalWordSet){
      word['color'] = 'primary';
    }
    for (let word of this.addWordSet){
      word['color'] = 'primary';
    }
    this.originalWordSet = [];
    this.removeWordSet = [];
    this.addWordSet = [];

    //deselect the IU
    if (this.selected_iu){
      for (var seg of this.selected_iu.getChildren(this.doc)){
        seg['selected'] = false;
      }
    }
    this.selected_iu = null;
    this.allowIuEdit = false;

    //enter IU mode
    this.bubbleMode = 'iu';
  }

  // this function highlights the similar IUS in the source text once a segment
  // is clicked in the summary card
  highlightIUs(summaryIU : IdeaUnit) : void{
    //only highlight segments in the source text card
    if(this.doc.doc_type == "source" && summaryIU && this.similarities != null){
      // disable previous highlights
      for (let iu of this.suggested_ius){
        iu.suggested = false;
      }
      this.suggested_ius = [];

      let local_sims = this.similarities[summaryIU.label];
      for (var i=0; i<5; i++){
        let label = local_sims[i][1];
        let suggested = this.doc.ius[label];
        this.suggested_ius.push(suggested);
      }

      //highlight the suggestions
      for (let iu of this.suggested_ius){
        iu.suggested = true;
      }
    }
  }
}
