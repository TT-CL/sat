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
import { Word, Sent, Segment, IdeaUnit, IUCollection } from '../data-objects';
import { TextService } from '../text.service';


@Component({
  selector: 'document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.sass']
})
export class DocumentViewerComponent implements OnInit {

  @Input() text = {};
  selected_iu : IdeaUnit = null;
  bubbleMode : string = "iu";
  doc : IUCollection = new IUCollection();

  //alignment data
  @Input() iuLinkInput : IdeaUnit;
  @Output() iuLinkOutput = new EventEmitter<IdeaUnit> ();
  suggested_ius : IdeaUnit[] = [];

  //max_auto_iu_index : Number = 0;
  //max_man_iu_index : Number = 0;

  //viewSelector
  @Input() selectedView: string = "textView";

  constructor() {}


  ngOnInit(){
    //this.getText();
  }

  // !-- PRINTERS --!
  punctuation : string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

  //procced when the file changes (file upload)
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      /*
      const chng = changes[propName];
      const cur  = JSON.stringify(chng.currentValue);
      const prev = JSON.stringify(chng.previousValue);
      console.log(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
      console.log("b");
      */
      if (propName == "text"){
        this.doc.readDocument(this.text);
      }
      if (propName == "selectedView"){
        // clear the selections every time I change a view
        this.toggleIuSelect();
      }
      if (propName == "iuLinkInput"){
        if(this.iuLinkInput){
          console.log("received IU: " + this.iuLinkInput.getText());
          console.log("linked IUs: ");
          console.log(this.iuLinkInput.linkedIus.length);
        }
        if(this.doc.doc_type == "Source text"){
          console.log("highlighting random ius");
          this.highlightIUs(this.iuLinkInput);
          this.toggleIuSelect();
        }else if (this.iuLinkInput){
          this.selected_iu.toggleIuLink(this.iuLinkInput);
        }
      }
    }
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
    this.toggleIuSelect(seg.iu);

    if(this.selected_iu){
      this.allowIuEdit = true;
    }else {
      this.allowIuEdit = false;
    }
  }

  linkClick(seg) : void {
    this.toggleIuSelect(seg.iu);
    if (this.doc.doc_type == "Summary text" && this.selected_iu){
      console.log("this is a summary");
      this.iuLinkOutput.emit(seg.iu);
    }else if (this.doc.doc_type == "Source text" && this.selected_iu){
      console.log("this is a source text");
      this.iuLinkOutput.emit(seg.iu);
      //if I have an input link
      if (this.iuLinkInput){
        seg.iu.toggleIuLink(this.iuLinkInput);
      }
    }
  }

  toggleIuSelect(tog_iu: IdeaUnit = null) : void {
    if(tog_iu == null){
      //default case: deselect the IUS
      if (this.selected_iu){
        for (var seg of this.selected_iu.childSegs){
          seg['selected'] = false;
        }
        this.selected_iu = null;
      }
    }else{
      if (this.selected_iu){
        if (this.selected_iu.label != tog_iu.label){
          for (var seg of this.selected_iu.childSegs){
            seg['selected'] = false;
          }
          for (var seg of tog_iu.childSegs){
            seg['selected'] = true;
          }
          this.selected_iu = tog_iu;
        }else{
          for (var seg of tog_iu.childSegs){
            seg['selected'] = false;
          }
          this.selected_iu = null;
        }
      }else{
        for (var seg of tog_iu.childSegs){
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
    for (let seg of this.selected_iu.childSegs){
      for (let word of seg['words']){
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
      removeWord.remove();
    }
    let iu = this.selected_iu;
    for (var word of this.addWordSet){
      iu.addWord(word);
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
      for (var seg of this.selected_iu.childSegs){
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
    if(this.doc.doc_type == "Source text" && summaryIU){
      // disable previous highlights
      for (let iu of this.suggested_ius){
        iu.suggested = false;
      }
      this.suggested_ius = [];

      //select a random IU
      console.log(this.doc.ius.size);
      let random_idx = Math.floor(Math.random() * this.doc.ius.size);
      let random_iu = Array.from(this.doc.ius)[random_idx];
      console.log(random_iu[1].getText());
      this.suggested_ius.push(random_iu[1]);

      //highlight the suggestions
      for (let iu of this.suggested_ius){
        iu.suggested = true;
      }
    }
  }
}