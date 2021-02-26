const punctuation : string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export class Word {
  text : string;
  color : string;     //mat-color property
  iu : string;      //parent iu
  seg : number;      //parent segment
  index : number;  //the word index (for ordering)

  constructor(text: string, index : number){
    this.text = text;
    this.index = index;
    this.color = "primary"; }

  remove(refDoc: IUCollection){
    //let old_seg = this.seg;
    let old_seg = refDoc.findSegment(this.seg);
    old_seg.detachWord(this, refDoc);
  }
}

export class Segment {
  words: number[];      //array of child word indexes
  iu : string;      //the parent iu
  index: number;

  type : string;
  constructor(doc: IUCollection, type: string = "default"){
    this.words = [];
    this.iu = null;
    this.type = type;
    //increasing unique segmend indexes
    this.index = doc.max_seg_count;
    doc.max_seg_count = doc.max_seg_count + 1;
  }

  getText(refDoc : IUCollection, printIuLabel = false) : string {
    let res : string = ""

    for (let word of this.getWords(refDoc)){
      let spacer: string = " ";
      if (punctuation.includes(word.text)){
        spacer = "";
      }
      res = res + spacer + word.text;
    }
    if (printIuLabel && this.iu){
      if (refDoc.ius[this.iu].disc){
        res = this.iu + "|" + res;
      }
    }
    return res.trim();
  }

  detachWord(delWord: Word, refDoc: IUCollection){
    delWord.seg = null;
    // index of the word INSIDE the segment, not in the document
    let word_idx = this.words.indexOf(delWord.index);
    if (this.words.length == 1){
      // this is the last word of the segment
      refDoc.ius[this.iu].detachSegment(this, refDoc);
      refDoc.addGhostWord(delWord,this,"before");
      refDoc.removeSeg(this);
    }else if (word_idx == 0){
      //detaching the word at the beginning of the segment, no disc IU variation
      this.words.splice(word_idx,1);
      refDoc.addGhostWord(delWord,this,"before");
    }else if(word_idx == this.words.length-1){
      //detaching word is at the end of a segment, no disc IU variation
      this.words.splice(word_idx,1);
      refDoc.addGhostWord(delWord,this,"after");
    }else{
      // the word is in the middle of a segment, the segment becomes discontinuous
      //initialize a new segment for the discontinuous part
      let new_seg = new Segment(refDoc);

      new_seg.words = this.words.slice(word_idx+1,this.words.length);
      new_seg.iu = this.iu;

      refDoc.ius[this.iu].childSegs[new_seg.index] = new_seg.index;
      for (let new_word of new_seg.getWords(refDoc)){
        new_word.seg = new_seg.index;
      }
      //add the new segment
      refDoc.segs.splice(refDoc.segs.indexOf(this)+1,0,new_seg);

      //set the disc flag
      refDoc.ius[this.iu].disc = true;
      // remove the unnecessary words
      this.words = this.words.slice(0,word_idx);

      //handle the single word
      refDoc.addGhostWord(delWord,this,"after");
    }
  }

  getWords(refDoc: IUCollection) : Word[]{
    let wordArray : Word[] = [];
    for (let w_idx of this.words){
      wordArray.push(refDoc.words[w_idx]);
    }
    return wordArray;
  }
}

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

export class IUCollection {
  doc_name: string;
  doc_type: string;
  words: Word[];
  ius: {[key: string]: IdeaUnit};
  segs: Segment[];
  sents: string[];

  max_seg_count : number;
  ghost_seg_count : number;
  manual_iu_count : number;

  constructor(){
    this.cleanup();
  }

  private cleanup(){
    this.ius = {};
    this.segs = [];
    this.sents = [];
    this.words = [];
    this.max_seg_count = 0;
    this.ghost_seg_count = 0;
    this.manual_iu_count = 0;
  }

  empty(): boolean{
    return this.words.length == 0;
  }

  private parseFile(text: object){
    console.log(text);
    this.doc_name = text["doc_name"];
    this.doc_type = text["doc_type"];
    //seg boundary spy
    let prev_label : string = "";
    for (var read_sent of text["sents"]){
      // temporary sentence string
      let temp_sent : string = "";

      for (var read_word of read_sent["words"]){
        //initializing Word object
        let temp_word : Word = new Word(read_word["text"], read_word["word_index"]);

        //automatically generated IUs are prefixed with the "a" letter
        let iu_label = "a" + read_word["iu_index"];
        //boundary check
        if (iu_label != prev_label){
          //console.log("boundary");
          prev_label = iu_label;
          //creating an empty segment
          //increase the segment index
          let temp_seg = new Segment(this);
          this.segs.push(temp_seg);
        }
        //the current segment is always the last
        let cur_seg = this.segs[this.segs.length-1];
        //add word to the segment
        cur_seg.words.push(temp_word.index);
        //link the segment to the word
        temp_word.seg = cur_seg.index;

        if (!(iu_label in this.ius)){
          //console.log("iu not in memory");
          //creating an empty segment
          let temp_IU = new IdeaUnit(iu_label,read_word["disc"]);
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
        if (punctuation.includes(read_word["text"])){
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

  readDocument(file : object){
    this.cleanup();
    this.parseFile(file);
  }

  getText(): string {
    let resText : string  = "";
    for (let sent of this.sents){
      resText = resText + "\n" + sent;
    }
    return resText.trim();
  }

  removeSeg(delSeg: Segment): void {
    let index = this.segs.indexOf(delSeg);
    this.segs.splice(index,1);
  }

  addGhostWord(word : Word, segment: Segment, mode: string){
    //create the new structures
    let ghostSeg = new Segment(this, "ghost");
    let ghostLabel = "m"+this.ghost_seg_count;
    let ghostIU = new IdeaUnit(ghostLabel,false);
    this.ghost_seg_count = this.ghost_seg_count + 1;
    word.seg = ghostSeg.index;
    word.iu = ghostIU.label;

    ghostIU.childSegs[ghostSeg.index] = ghostSeg.index;
    ghostSeg.words.push(word.index);
    ghostSeg.iu = ghostIU.label;

    //add structures to memory
    this.ius[ghostLabel] = ghostIU;
    let seg_idx = this.segs.indexOf(segment);

    switch(mode){
      case "before":{
        this.segs.splice(seg_idx,0,ghostSeg);
        break;
      }

      case "after":{
        this.segs.splice(seg_idx+1,0,ghostSeg);
        break;
      }

      default:{
        break;
      }
    }
  }

  removeIU(iuLabel : string): void {
    console.log("Removing iu "+ iuLabel);
    let iu = this.ius[iuLabel];
    for (var index in iu.childSegs){
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
  

  findSegment(segIndex : number): Segment{
    return this.segs.find(seg => seg.index == segIndex);
  }

  reconsolidate(anon: any){
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
    for (let anon_sent of anon.sents){
      this.sents.push(anon_sent);
    }
    //complex objects
    //words
    for (let anon_word of anon.words){
      let word = new Word(anon_word.text,anon_word.index);
      word.color = anon_word.color;
      word.iu = anon_word.iu;
      word.seg = anon_word.seg;
      this.words.push(word);
    }

    //segs
    for (let anon_seg of anon.segs){
      let seg = new Segment(this);
      seg.index = anon_seg.index;
      seg.iu = anon_seg.iu;
      seg.type = anon_seg.type;
      for (let anon_word of anon_seg.words){
        seg.words.push(anon_word);
      }
      this.segs.push(seg);
    }

    //ius
    for (let anon_index in anon.ius){
      let anon_iu = anon.ius[anon_index];
      let iu = new IdeaUnit();
      iu.disc = anon_iu.disc;
      iu.label = anon_iu.label;
      iu.suggested = anon_iu.suggested;
      for (let anon_linked_iu of anon_iu.linkedIus){
        iu.linkedIus.push(anon_linked_iu);
      }
      for (let index in anon_iu.childSegs){
        let child_seg_idx = anon_iu.childSegs[index];
        iu.childSegs[child_seg_idx] = child_seg_idx;
      }
      this.ius[anon_index] = iu;
    }
  }
}

export class Project {
  name : string;
  description: string;
  creation_time: Date;
  last_edit : Date;
  sourceDoc : IUCollection;
  summaryDocs : IUCollection[];

  constructor(){
    this.last_edit = new Date();
  }

  hasSummaries(): boolean{
    if (this.summaryDocs){
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

    this.summaryDocs = [];
    for (let anon_summary of anon.summaryDocs){
      let summary = new IUCollection();
      summary.reconsolidate(anon_summary);
      this.summaryDocs.push(summary);
    }
  }
}
