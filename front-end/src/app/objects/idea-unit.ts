import { IUCollection } from './iu-collection';
import { Word } from './word';
import { Segment } from './segment';


export class IdeaUnit {
  label : string;           //IU label
  disc : boolean;           //discontinuous flag
  childSegs : {[key: string]: number}; //set of child segment indexes

  //reference to document container
  linkedIus : string[];
  suggested : boolean;
  //color : string;

  constructor(label?: string, disc? : boolean){
    this.label = label || null;
    this.childSegs = {};
    this.disc = disc || null;
    this.linkedIus = [];
    this.suggested = false;
    //this.color = "Primary";
  }

  empty(): boolean {
    return this.label == null;
  }

  getText(refDoc: IUCollection): string{
    let res = "";
    for (let index in this.childSegs){
      let child_idx = this.childSegs[index];
      let child = refDoc.findSegment(child_idx);
      res = res + " " + child.getText(refDoc);
    }
    return res.trim();
  }

  detachSegment(delSeg: Segment, refDoc: IUCollection){
    delSeg.iu = null;
    switch (Object.keys(this.childSegs).length){
      case 1:{
        // the iu needs to be removed
        refDoc.removeIU(this.label);
        break;
      }
      case 2:{
        // the iu only has 2 segments.
        // by removing 1 it will stop being discontinuous
        delete this.childSegs[delSeg.index];
        this.disc = false;
        break;
      }
      default:{
        delete this.childSegs[delSeg.index];
        break;
      }
    }
  }

  addWord(word:Word, refDoc: IUCollection){
    word.remove(refDoc);
    //bookmark for the ghost structures
    let ghostIU = word.iu;
    let ghostSeg = refDoc.findSegment(word.seg);

    let adjWords : Word[] = [];
    for (var index in this.childSegs){
      let seg_idx = this.childSegs[index];
      let seg = refDoc.findSegment(seg_idx);
      for (var w of seg.getWords(refDoc)){
        if (Math.abs(w.index-word.index)==1){
          //I found an adjacent word
          adjWords.push(w);
        }
      }
    }
    console.log("adj words: "+adjWords.length);
    switch(adjWords.length){
      case 1:{
        //the word is close to an existing segment
        word.iu = this.label;
        word.seg = adjWords[0].seg;
        let adjSeg = refDoc.findSegment(adjWords[0].seg);
        if (word.index > adjWords[0].index){
          //append word at the end of a segment
          adjSeg.words.push(word.index);
        }else{
          //append word at the start of a segment
          adjSeg.words.unshift(word.index);
        }

        break;
      }
      case 2:{
        //the word joins two existing segments
        //assign the segment to the left as master and delete the one on the right
        let master_seg : Segment;
        let del_seg : Segment;
        if (word.index > adjWords[0].index){
          master_seg = refDoc.findSegment(adjWords[0].seg);
          del_seg = refDoc.findSegment(adjWords[1].seg);
        }else{
          master_seg = refDoc.findSegment(adjWords[1].seg);
          del_seg = refDoc.findSegment(adjWords[0].seg);
        }
        //handle the single word
        word.iu = this.label;
        word.seg = master_seg.index;
        master_seg.words.push(word.index);
        //join the two segments
        for (w of del_seg.getWords(refDoc)){
          w.seg = master_seg.index;
          master_seg.words.push(w.index);
        }
        refDoc.ius[del_seg.iu].detachSegment(del_seg,refDoc);
        refDoc.removeSeg(del_seg);
        if (Object.keys(this.childSegs).length == 1){
          this.disc = false;
        }

        break;
      }
      default:{
        // the word is far away from the segments
        // ensure that the existing segments won't be ghosts any longer
        for (var index in this.childSegs){
          let s_idx = this.childSegs[index];
          let s = refDoc.findSegment(s_idx);
          s.type = "default";
        }
        //create the new segment for the words far a way
        let new_seg : Segment = new Segment(refDoc);
        new_seg.words.push(word.index);
        new_seg.iu = this.label;
        word.seg = new_seg.index;
        word.iu = this.label;
        this.disc = true;

        this.childSegs[new_seg.index] = new_seg.index;
        refDoc.segs.splice(refDoc.segs.indexOf(ghostSeg)+1,0,new_seg);
        break;
      }
    }

    //remove the ghost structures from memory

    refDoc.removeIU(ghostIU)
  }

  toggleIuLink(toLink : IdeaUnit) : void {
    if(this.linkedIus.includes(toLink.label)){
      this.linkedIus.splice(this.linkedIus.indexOf(toLink.label),1);
    }else{
      this.linkedIus.push(toLink.label);
    }
  }

  getChildren(refDoc: IUCollection) : Segment[]{
    let segArray : Segment[] = [];
    for (let index in this.childSegs){
      let s_idx = this.childSegs[index];
      segArray.push(refDoc.findSegment(s_idx));
    }
    return segArray;
  }
}