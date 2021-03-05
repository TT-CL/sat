import { Word } from './word';
import { Segment } from './segment';
import { IdeaUnit } from './idea-unit';


const punctuation: string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';


export class IUCollection {
  doc_name: string;
  doc_type: string;
  words: Word[];
  ius: { [key: string]: IdeaUnit };
  segs: Segment[];
  sents: string[];

  max_seg_count: number;
  ghost_seg_count: number;
  manual_iu_count: number;

  constructor() {
    this.cleanup();
  }

  private cleanup() {
    this.ius = {};
    this.segs = [];
    this.sents = [];
    this.words = [];
    this.max_seg_count = 0;
    this.ghost_seg_count = 0;
    this.manual_iu_count = 0;
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

        //automatically generated IUs are prefixed with the "a" letter
        let iu_label = "a" + read_word["iu_index"];
        //boundary check
        if (iu_label != prev_label) {
          //console.log("boundary");
          prev_label = iu_label;
          //creating an empty segment
          //increase the segment index
          let temp_seg = new Segment(this);
          this.segs.push(temp_seg);
        }
        //the current segment is always the last
        let cur_seg = this.segs[this.segs.length - 1];
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
    let index = this.segs.indexOf(delSeg);
    this.segs.splice(index, 1);
  }

  addGhostWord(word: Word, segment: Segment, mode: string) {
    //create the new structures
    let ghostSeg = new Segment(this, "ghost");
    let ghostLabel = "m" + this.ghost_seg_count;
    let ghostIU = new IdeaUnit(ghostLabel, false);
    this.ghost_seg_count = this.ghost_seg_count + 1;
    word.seg = ghostSeg.index;
    word.iu = ghostIU.label;

    ghostIU.childSegs[ghostSeg.index] = ghostSeg.index;
    ghostSeg.words.push(word.index);
    ghostSeg.iu = ghostIU.label;

    //add structures to memory
    this.ius[ghostLabel] = ghostIU;
    let seg_idx = this.segs.indexOf(segment);

    switch (mode) {
      case "before": {
        this.segs.splice(seg_idx, 0, ghostSeg);
        break;
      }

      case "after": {
        this.segs.splice(seg_idx + 1, 0, ghostSeg);
        break;
      }

      default: {
        break;
      }
    }
  }

  removeIU(iuLabel: string): void {
    console.log("Removing iu " + iuLabel);
    let iu = this.ius[iuLabel];
    for (var index in iu.childSegs) {
      let seg = iu.childSegs[index];
      this.removeSeg(this.findSegment(seg));
    }
    delete this.ius[iu.label];
  }

  /**
   * Commenting this function out.
   * Now that the data structure is not circular anymore I want to send
   * the whole IUCollection instead
  //this function prepares a new JSON object and serializes it
  //necessary due to the circular references in my data structure
  jsonSerialize() : object {
    var json = {"doc_name" : this.doc_name,
                "doc_type" : this.doc_type };
    let tempIus = {};
    var refDoc = this;
    for (let index in this.ius){
      let iu = this.ius[index];
      //temp structure for array of words
      let tempSeg = []
      //explore the child segments
      for (var s of iu.getChildren(refDoc)){
        //extract the words from each segment
        for (var w_idx of s.words){
          tempSeg.push(refDoc.words[w_idx].text);
        }
      }
      // associate the array of words to the iu index
      tempIus[index]=tempSeg;
    }

    json["ius"] = tempIus;
    //return JSON.stringify(json);
    return json;
  }
  **/


  findSegment(segIndex: number): Segment {
    return this.segs.find(seg => seg.index == segIndex);
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
    this.ghost_seg_count = anon.ghost_seg_count;
    this.manual_iu_count = anon.manual_iu_count;
    this.max_seg_count = anon.max_seg_count;
    for (let anon_sent of anon.sents) {
      this.sents.push(anon_sent);
    }
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
    for (let anon_seg of anon.segs) {
      let seg = new Segment(this);
      seg.index = anon_seg.index;
      seg.iu = anon_seg.iu;
      seg.type = anon_seg.type;
      for (let anon_word of anon_seg.words) {
        seg.words.push(anon_word);
      }
      this.segs.push(seg);
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
}