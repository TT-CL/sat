import { IUCollection } from './iu-collection';


export class Project {
  name: string;
  description: string;
  creation_time: Date;
  last_edit: Date;
  sourceDoc: IUCollection;
  summaryDocs: IUCollection[];
  //DB values
  _id;
  user_id;
  deleted : boolean;

  constructor() {
    this.last_edit = new Date();
  }

  hasSummaries(): boolean {
    if (this.summaryDocs) {
      return this.summaryDocs.length != 0;
    }
    return false;
  }

  reconsolidate(anonymous_oject: object) {
    /**
    console.log("Reconsolidate")
    console.log(this)
    console.log(anonymous_oject);
    **/
    //casting anonymous object as a Project
    let anon = anonymous_oject as Project
    //converting strings to dates
    this.creation_time = new Date(anon.creation_time);
    this.last_edit = new Date(anon.last_edit);
    //assign static values
    this.name = anon.name;
    this.description = anon.description;
    this.sourceDoc = new IUCollection();
    this.sourceDoc.reconsolidate(anon.sourceDoc);
    //DB values
    this._id = anon._id;
    this.user_id = anon.user_id;
    this.deleted = anon.deleted;

    this.summaryDocs = [];
    if (anon.summaryDocs) {
      for (let anon_summary of anon.summaryDocs) {
        let summary = new IUCollection();
        summary.reconsolidate(anon_summary);
        this.summaryDocs.push(summary);
      }
    }
  }

  purgeProjectLinks() {
    // THIS FUNCTION PURGES ALL MANUAL LINKS
    // BE CAREFUL!
    if (this.summaryDocs){ //check if the project has summaries first
      this.summaryDocs.forEach(summary => {
        for (let iu_idx in summary.ius) {
          let iu = summary.ius[iu_idx];
          iu.linkedIus = [];
        }
      })
    }
  }
}