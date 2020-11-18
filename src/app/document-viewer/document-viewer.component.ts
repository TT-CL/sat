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
import { TextService } from '../text.service'


@Component({
  selector: 'document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.sass']
})
export class DocumentViewerComponent implements OnInit {

  @Input() text = {};
  words : Object[] = [];
  word_count : Number = null;
  segs : Object[] = [];
  sents : Object[] = [];
  ius : Object = {};
  selected_iu : string = null;
  bubbleMode : string = "iu";

  clearData(): void {
    this.words = [];
    this.segs = [];
    this.sents = [];
    this.ius = {};
    this.selected_iu = null;
  }
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

  getSegText(segment, iuMode = false) : string {
    let res : string = ""

    for (let w_idx of segment["words"]){
      let word : string = this.words[w_idx]['text'];
      let spacer: string = " ";
      if (this.punctuation.includes(word)){
        spacer = "";
      }
      res = res + spacer + word;
    }
    if (iuMode){
      let iu = this.ius[segment.iu_label]
      if (iu.disc){
        res = segment.iu_label + "|" + res;
      }
    }
    return res.trim();
  }

  getSentText(sent) : string {
    let res : string = ""

    for (let seg_idx of sent){
      let seg_text : string = this.getSegText(this.segs[seg_idx]);
      let spacer: string = " ";
      if (this.punctuation.includes(seg_text)){
        spacer = "";
      }
      res = res + spacer + seg_text;
    }
    return res.trim();
  }

  getDocText(): string {
    let resText : string  = "";
    for (let sent of this.sents){
      resText = resText + "\n" + this.getSentText(sent);
    }
    return resText.trim();
  }

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
        this.clearData();
        //loading document from JSON structure
        if (this.text){
          console.log(this.text)
          let prev_w_label = "";

          for (var s of this.text["sents"]){
            let sent : Object [] = [];
            for (var w of s["words"]){

              let iu_label = "a" + w.iu_index;
              if (iu_label != prev_w_label){
                //segment boundary detected
                prev_w_label = iu_label
                this.segs.push({
                  'iu_label' : iu_label,
                  'selected': false,
                  'words' : []
                });
                sent.push(this.segs.length-1);
                //console.log("idx: "+this.segs.length-1);
              }
              let seg_idx = this.segs.length-1;
              let seg = this.segs[seg_idx];

              if (!(iu_label in this.ius)){
                //console.log("IU not in dictionary");
                this.ius[iu_label]={
                  'segs' : new Set(),
                  'disc' : w.disc
                };
                this.ius[iu_label].segs.add(this.segs.length-1);
              }else{
                this.ius[iu_label].segs.add(this.segs.length-1);
              }


              //console.log(w);
              let word : Object = {
                'text' : w.text,
                'iu_label' : iu_label,
                'seg_idx' : seg_idx,
                'color' : "primary",
                'selected' : true
              };
              this.words.push(word);
              if(w.word_index!=this.words.length-1){
                console.log("ERROR: Word index mismatch");
              }
              //add word to segment
              seg['words'].push(this.words.length-1);
            }

            this.sents.push(sent);
          }
        }
      }
      /*
      for (let key in this.words){
        console.log(this.words[key]);
      }
      */
      //console.log(this.disc_labels)
      console.log(this.ius);
      console.log(this.sents);
      console.log(this.segs);
      console.log(this.words);

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
    this.toggleIuSelect(seg.iu_label);

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
        for (var seg_idx of this.ius[this.selected_iu].segs){
          this.segs[seg_idx]['selected'] = false;
        }
        for (var seg_idx of this.ius[iu_label].segs){
          this.segs[seg_idx]['selected'] = true;
        }
        this.selected_iu = iu_label;
      }else{
        for (var seg_idx of this.ius[iu_label].segs){
          this.segs[seg_idx]['selected'] = false;
        }
        this.selected_iu = null;
      }
    }else{
      for (var seg_idx of this.ius[iu_label].segs){
        this.segs[seg_idx]['selected'] = true;
      }
      this.selected_iu = iu_label;
    }
  }

  originalWordSet : Object[] = [];
  removeWordSet : Object[] = [];
  addWordSet : Object[] = [];

  engageEditIuMode() : void {
    console.log("Trying to edit Segment "+ this.selected_iu);
    this.bubbleMode = "word";
    for (let seg_idx of this.ius[this.selected_iu]['segs']){
      for (let word_idx of this.segs[seg_idx]['words']){
        let word = this.words[word_idx];
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
        word['color'] = 'warn';
      }else{
        //remove the word from the selection set
        this.addWordSet.splice(word);
        word['color'] = 'primary';
      }
    }
  }

  iuEditSave(): void{
    //save the edits
    for (let removeWord of this.removeWordSet){
      let tempSeg = removeWord['seg_idx'];
    }
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
    this.originalWordSet = [];
    this.removeWordSet = [];
    this.addWordSet = [];

    //deselect the IU
    for (var seg_idx of this.ius[this.selected_iu].segs){
      this.segs[seg_idx]['selected'] = false;
    }
    this.selected_iu = null;

    //enter IU mode
    this.bubbleMode = 'iu';
  }
}
