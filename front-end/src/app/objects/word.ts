import { IUCollection } from './iu-collection';


export class Word {
  text: string;
  color: string;     //mat-color property
  iu: string;      //parent iu
  seg: number;      //parent segment
  index: number;  //the word index (for ordering)

  constructor(text: string, index: number) {
    this.text = text;
    this.index = index;
    this.color = "primary";
  }

  remove(refDoc: IUCollection) {
    //let old_seg = this.seg;
    let old_seg = refDoc.findSegment(this.seg);
    old_seg.detachWord(this, refDoc);
  }
}