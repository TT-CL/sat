import {
  Component,
  OnInit,
  Input,
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
  selected_iu : string = null;
  bubbleMode : string = "iu";
  doc : IUCollection = new IUCollection();
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
    console.log(seg);
    this.toggleIuSelect(seg.iu.label);

    if(this.selected_iu == null){
      this.allowIuEdit = false;
      this.allowIuCreation = false;
    }else {
      this.allowIuEdit = true;
      this.allowIuCreation = false;
    }
  }

  toggleIuSelect(iu_label) : void {
    if (this.selected_iu != null){
      if (this.selected_iu != iu_label){
        for (var seg of this.doc.ius.get(this.selected_iu).childSegs){
          seg['selected'] = false;
        }
        for (var seg of this.doc.ius.get(iu_label).childSegs){
          seg['selected'] = true;
        }
        this.selected_iu = iu_label;
      }else{
        for (var seg of this.doc.ius.get(iu_label).childSegs){
          seg['selected'] = false;
        }
        this.selected_iu = null;
      }
    }else{
      for (var seg of this.doc.ius.get(iu_label).childSegs){
        seg['selected'] = true;
      }
      this.selected_iu = iu_label;
    }
  }

  originalWordSet : Word[] = [];
  removeWordSet : Word[] = [];
  addWordSet : Word[] = [];

  engageEditIuMode() : void {
    console.log("Trying to edit Segment "+ this.selected_iu);
    this.bubbleMode = "word";
    for (let seg of this.doc.ius.get(this.selected_iu).childSegs){
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

    //return to IU mode
    this.iuEditCancel();
  }

  //this function checks edited segments and updates their information
  segmentCleanup(seg): void{

  }
  iuCleanup(): void{

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
    for (var seg of this.doc.ius.get(this.selected_iu).childSegs){
    seg['selected'] = false;
    }
    this.selected_iu = null;
    this.allowIuEdit = false;

    //enter IU mode
    this.bubbleMode = 'iu';
  }
}
