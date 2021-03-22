import { Word } from './word';
import { Segment } from './segment';
import { IdeaUnit } from './idea-unit';


const punctuation: string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';


export class IUCollection {
  doc_name: string;
  doc_type: string;
  words: Word[];
  ius: { [key: string]: IdeaUnit };
  segs: { [key: number]: Segment };
  sents: string[];

  //db values
  _id
  user_id
  project_id
  history_id
  deleted: boolean
  version: number

  max_seg_count: number;
  manual_iu_count: number;


  max_connected_idx: number;
  max_disc_idx: number;

  constructor() {
    this.cleanup();
  }

  private cleanup() {
    this.ius = {};
    this.segs = [];
    this.sents = [];
    this.words = [];
    this.max_seg_count = 0;
    this.manual_iu_count = 0;
    this.max_connected_idx = 1;
    this.max_disc_idx = 1;
  }

  empty(): boolean {
    return this.words.length == 0;
  }

  private parseFile(text: object) {
    console.log(text);
    this.doc_name = text["doc_name"];
    this.doc_type = text["doc_type"];
    //seg boundary spy
    let prev_label: string = "";
    for (var read_sent of text["sents"]) {
      // temporary sentence string
      let temp_sent: string = "";

      for (var read_word of read_sent["words"]) {
        //initializing Word object
        let temp_word: Word = new Word(read_word["text"], read_word["word_index"]);

        //automatically generated IUs are prefixed with the letter "a"
        let prefix = "a";
        if (read_word["iu_label"] == "MAN"){
          //manually generated IUs are prefixed with the letter "m" 
          prefix = "m"
        }
        let iu_label = prefix + read_word["iu_index"];
        //boundary check
        if (iu_label != prev_label) {
          //console.log("boundary");
          prev_label = iu_label;
          //creating an empty segment
          //increase the segment index
          let temp_seg = new Segment();
          temp_seg.index = this.max_seg_count;
          this.segs[temp_seg.index] = temp_seg;
          this.max_seg_count += 1;
        }
        //the current segment is always the last
        let cur_seg = this.segs[this.max_seg_count -1];
        //add word to the segment
        cur_seg.words.push(temp_word.index);
        //link the segment to the word
        temp_word.seg = cur_seg.index;

        if (!(iu_label in this.ius)) {
          //console.log("iu not in memory");
          //creating an empty segment
          let temp_IU = new IdeaUnit(iu_label, read_word["disc"]);
          this.ius[iu_label] = temp_IU;
        }
        //adding segment to IU structure
        let cur_IU = this.ius[iu_label];

        cur_IU["childSegs"][cur_seg.index] = cur_seg.index;

        //adding IU references to a word and segment structure
        cur_seg.iu = cur_IU.label;
        temp_word.iu = cur_IU.label;

        //Rebuilding sentences
        let spacer = " ";
        if (punctuation.includes(read_word["text"])) {
          spacer = "";
        }
        temp_sent = temp_sent + spacer + read_word["text"];
        //adding Word object to memory
        this.words.push(temp_word);
      }
      //adding Sent object to memory
      this.sents.push(temp_sent.trim());
    }


    console.log(this);
  }

  readDocument(file: object) {
    this.cleanup();
    this.parseFile(file);
  }

  getText(): string {
    let resText: string = "";
    for (let sent of this.sents) {
      resText = resText + "\n" + sent;
    }
    return resText.trim();
  }

  removeSeg(delSeg: Segment): void {
    delete this.segs[delSeg.index];
  }

  reconsolidate(anon: any) {
    /**
    console.log("reconsolidate");
    console.log(this);
    console.log(anon);
    **/
    //standard objs
    this.doc_name = anon.doc_name;
    this.doc_type = anon.doc_type;
    this.manual_iu_count = anon.manual_iu_count;
    this.max_seg_count = anon.max_seg_count;
    for (let anon_sent of anon.sents) {
      this.sents.push(anon_sent);
    }
    //db objects
    this._id = anon._id;
    this.user_id = anon.user_id;
    this.project_id = anon.project_id;
    this.history_id = anon.history_id;
    this.deleted = anon.deleted;
    this.version = anon.version;
    //complex objects
    //words
    for (let anon_word of anon.words) {
      let word = new Word(anon_word.text, anon_word.index);
      word.color = anon_word.color;
      word.iu = anon_word.iu;
      word.seg = anon_word.seg;
      this.words.push(word);
    }

    //segs
    for (let anon_seg_idx in anon.segs) {
      let anon_seg = anon.segs[anon_seg_idx]
      //since I can delete the segments there might be some inconsistencies in
      //the indexes (null segs) when serialized
      if (anon_seg != null){
        let seg = new Segment();
        seg.index = anon_seg.index;
        seg.iu = anon_seg.iu;
        seg.type = anon_seg.type;
        for (let anon_word of anon_seg.words) {
          seg.words.push(anon_word);
        }
        this.segs[seg.index] = seg;
      }
    }

    //ius
    for (let anon_index in anon.ius) {
      let anon_iu = anon.ius[anon_index];
      let iu = new IdeaUnit();
      iu.disc = anon_iu.disc;
      iu.label = anon_iu.label;
      iu.suggested = anon_iu.suggested;
      for (let anon_linked_iu of anon_iu.linkedIus) {
        iu.linkedIus.push(anon_linked_iu);
      }
      for (let index in anon_iu.childSegs) {
        let child_seg_idx = anon_iu.childSegs[index];
        iu.childSegs[child_seg_idx] = child_seg_idx;
      }
      this.ius[anon_index] = iu;
    }
  }

  prepareWorksheet(source: IUCollection = null){
    let doc = this;
    let res = [];
    if(doc.doc_type == "summary"){
      res.push(["idx","Idea Unit", "-","Link idxs", "Linked Iu"]);
    }else{
      res.push(["idx", "Idea Unit"]);
    }
    for(let seg_idx in this.segs){
      let seg = this.segs[seg_idx];
      const iu = doc.ius[seg.iu]
      let row = [];
      row.push(seg.iu)
      row.push(seg.getText(doc));

      console.log(doc.doc_type);
      //if I am printing a summary I want to print the links as well
      if(doc.doc_type == "summary" && source != null){
        row.push()    //separator
        row.push(iu.linkedIus.join(', ')) //concat iu indexes
        for (let linked_label of iu.linkedIus){
          row.push(source.ius[linked_label].getText(source))
        }
      }
      res.push(row);
    }
    return res;
  }

  continuityCheck() {
    // this function merges neighboring segments if they have the same IU index.
    if (Object.keys(this.segs).length >1){
      let keys = Object.keys(this.segs);
      let prev_seg;
      let cur_seg;
      let seg_idx = 1;
      let array_len = keys.length;
      while (seg_idx < array_len) {
        let prev_seg = this.segs[keys[seg_idx -1]];
        let cur_seg = this.segs[keys[seg_idx]];
        if(prev_seg.iu == cur_seg.iu){
          //move the words inside the previous segment
          cur_seg.words.map(w =>{
            //deep copy
            prev_seg.words.push(JSON.parse(JSON.stringify(w)))
          });
          //remove the segment reference from the IU
          let iu = this.ius[cur_seg.iu];
          delete iu.childSegs[seg_idx];
          //adjust discontinuous flag
          if (iu.childSegs.length > 1){
            iu.disc = true;
          }else{
            iu.disc = false;
          }
          //remove the current element
          delete this.segs[keys[seg_idx]];
          // reduce the array_len
          keys = Object.keys(this.segs)
          array_len = keys.length;
        }else{
          seg_idx += 1;
        }
      }
    }
  }

  getSegArray(): Array<Segment>{
    let res: Array<Segment> = [];
    for (let key in this.segs) {
      res.push(this.segs[key]);
    };
    return res;
  }

  connectSegs(selectedIUs: Set<string>){
    let iuLabel = "c" + this.max_connected_idx;
    this.max_connected_idx += 1;
    // add the new IU
    let newIu = new IdeaUnit(iuLabel, true);
    for (let idx in this.segs) {
      let seg = this.segs[idx];
      if (selectedIUs.has(seg.iu)) {
        delete this.ius[seg.iu];
        seg.iu = iuLabel;
        newIu.childSegs[seg.index] = seg.index;
      }
    };
    this.ius[iuLabel] = newIu;
  }

  disconnectSegs(selectedIUs : Set<string>){
    selectedIUs.forEach(sel_iu_label =>{
      let sel_iu = this.ius[sel_iu_label];
      if(sel_iu.disc){
        for(let key in sel_iu.childSegs){
          let seg_idx = sel_iu.childSegs[key];
          // find each segment
          let child_seg = this.segs[seg_idx]
          // create a new IU for each segment
          let iuLabel = "d" + this.max_disc_idx;
          this.max_disc_idx += 1;
          let newIu = new IdeaUnit(iuLabel, false);
          newIu.childSegs[child_seg.index] = child_seg.index;
          // store values
          this.ius[iuLabel] = newIu;
          child_seg.iu = iuLabel;
        }
        //remove the old iu from memory
        delete this.ius[sel_iu_label];
      }
    });
  }

  getPreHtml():string{
    let data: string = "";
    for( let key in this.segs){
      let seg = this.segs[key];
      //each segment goes in a div.
      //divs are zebra colored via css
      data += "<div>" + seg.getText(this) + "</div>"
    };
    return data;
  }
}