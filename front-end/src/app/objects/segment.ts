import { IUCollection } from './iu-collection';
import { Word } from './word';


const punctuation: string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';


export class Segment {
  words: number[];      //array of child word indexes
  iu: string;      //the parent iu
  index: number;

  type: string;
  constructor(type: string = "default") {
    this.words = [];
    this.iu = null;
    this.type = type;
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

  getWords(refDoc: IUCollection): Word[] {
    let wordArray: Word[] = [];
    for (let w_idx of this.words) {
      wordArray.push(refDoc.words[w_idx]);
    }
    return wordArray;
  }
}
