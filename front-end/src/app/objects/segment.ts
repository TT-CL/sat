import { IUCollection } from './iu-collection';
import { Word } from './word';


const punctuation: string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';


export class Segment {
  words: number[];      //array of child word indexes
  iu: string;      //the parent iu
  index: number;

  type: string;
  constructor(doc: IUCollection, type: string = "default") {
    this.words = [];
    this.iu = null;
    this.type = type;
    //increasing unique segmend indexes
    this.index = doc.max_seg_count;
    doc.max_seg_count = doc.max_seg_count + 1;
  }

  getText(refDoc: IUCollection, printIuLabel = false): string {
    let res: string = ""

    for (let word of this.getWords(refDoc)) {
      let spacer: string = " ";
      if (punctuation.includes(word.text)) {
        spacer = "";
      }
      res = res + spacer + word.text;
    }
    if (printIuLabel && this.iu) {
      if (refDoc.ius[this.iu].disc) {
        res = this.iu + "|" + res;
      }
    }
    return res.trim();
  }

  detachWord(delWord: Word, refDoc: IUCollection) {
    delWord.seg = null;
    // index of the word INSIDE the segment, not in the document
    let word_idx = this.words.indexOf(delWord.index);
    if (this.words.length == 1) {
      // this is the last word of the segment
      refDoc.ius[this.iu].detachSegment(this, refDoc);
      refDoc.addGhostWord(delWord, this, "before");
      refDoc.removeSeg(this);
    } else if (word_idx == 0) {
      //detaching the word at the beginning of the segment, no disc IU variation
      this.words.splice(word_idx, 1);
      refDoc.addGhostWord(delWord, this, "before");
    } else if (word_idx == this.words.length - 1) {
      //detaching word is at the end of a segment, no disc IU variation
      this.words.splice(word_idx, 1);
      refDoc.addGhostWord(delWord, this, "after");
    } else {
      // the word is in the middle of a segment, the segment becomes discontinuous
      //initialize a new segment for the discontinuous part
      let new_seg = new Segment(refDoc);

      new_seg.words = this.words.slice(word_idx + 1, this.words.length);
      new_seg.iu = this.iu;

      refDoc.ius[this.iu].childSegs[new_seg.index] = new_seg.index;
      for (let new_word of new_seg.getWords(refDoc)) {
        new_word.seg = new_seg.index;
      }
      //add the new segment
      refDoc.segs.splice(refDoc.segs.indexOf(this) + 1, 0, new_seg);

      //set the disc flag
      refDoc.ius[this.iu].disc = true;
      // remove the unnecessary words
      this.words = this.words.slice(0, word_idx);

      //handle the single word
      refDoc.addGhostWord(delWord, this, "after");
    }
  }

  getWords(refDoc: IUCollection): Word[] {
    let wordArray: Word[] = [];
    for (let w_idx of this.words) {
      wordArray.push(refDoc.words[w_idx]);
    }
    return wordArray;
  }
}
