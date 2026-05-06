import { IUCollection } from './iu-collection';


export class Project {
  name: string | null = null;
  description: string | null = null;
  creation_time: Date;
  last_edit: Date;
  sourceDoc: IUCollection | null = null;
  summaryDocs: IUCollection[] | null = null;
  //DB values
  _id: any | null = null;
  user_id: any | null = null;
  deleted: boolean | null = null;

  constructor() {
    this.creation_time = new Date();
    this.last_edit = this.creation_time;
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
    this.creation_time = anon.creation_time ? new Date(anon.creation_time) : this.creation_time;
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
    if (this.summaryDocs) { //check if the project has summaries first
      this.summaryDocs.forEach(summary => {
        for (let iu_idx in summary.ius) {
          let iu = summary.ius[iu_idx];
          iu.linkedIus = [];
        }
      })
    }
  }

  addSummary(summary: IUCollection | IUCollection[] | Set<IUCollection>): void {
    if (this.summaryDocs === null) {
      throw new Error("Attempting to add summary when summary list not initialized.")
    }
    // create an array with the summaries to add
    const summariesToAdd =
      summary instanceof Set
        ? Array.from(summary)
        : Array.isArray(summary)
          ? summary
          : [summary];
    // add the summaries
    this.summaryDocs.push(...summariesToAdd);
  }

  removeSummary(summary: IUCollection | IUCollection[] | Set<IUCollection>): void {
    if (this.summaryDocs === null) {
      throw new Error("Attempting to remove summary when summary list not initialized.")
    }
    // create an array with the summaries to remove
    const summariesToRemove =
      summary instanceof Set
        ? Array.from(summary)
        : Array.isArray(summary)
          ? summary
          : [summary];

    // remove the summaries
    const idsToRemove = new Set(summariesToRemove.map(s => s._id));
    this.summaryDocs = this.summaryDocs.filter(s => !idsToRemove.has(s._id));
  }
}