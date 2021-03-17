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
}