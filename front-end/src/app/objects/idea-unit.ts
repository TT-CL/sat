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
      let child = refDoc.segs[child_idx];
      res = res + " " + child.getText(refDoc);
    }
    return res.trim();
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
      segArray.push(refDoc.segs[s_idx]);
    }
    return segArray;
  }
}