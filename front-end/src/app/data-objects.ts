const punctuation : string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export class Word {
  text : string;
  color : string;     //mat-color property
  iu : string;      //parent iu
  seg : Segment;      //parent segment
  selected : boolean; //html selected property
  index : number;  //the word index (for ordering)

  constructor(text: string, index : number){
    this.text = text;
    this.index = index;
    this.color = "primary";
    this.selected = true;  }

  remove(refDoc: IUCollection){
    //let old_seg = this.seg;
    this.seg.detachWord(this, refDoc);
  }
}

export class Segment {
  words: Word[];      //array of child words
  iu : IdeaUnit;      //the parent iu
  selected: boolean;  //html selected property
  index: number;

  type : string;
  constructor(doc: IUCollection, type: string = "default"){
    this.words = [];
    this.iu = null;
    this.selected = false;
    this.type = type;
    //increasing unique segmend indexes
    doc.max_seg_count = doc.max_seg_count + 1;
    this.index = doc.max_seg_count;
  }

  getText(printIuLabel = false) : string {
    let res : string = ""

    for (let word of this.words){
      let spacer: string = " ";
      if (punctuation.includes(word.text)){
        spacer = "";
      }
      res = res + spacer + word.text;
    }
    if (printIuLabel && this.iu){
      if (this.iu.disc){
        res = this.iu.label + "|" + res;
      }
    }
    return res.trim();
  }

  detachWord(delWord: Word, refDoc: IUCollection){
    delWord.seg = null;
    let word_idx = this.words.indexOf(delWord);
    if (this.words.length == 1){
      // this is the last word of the segment
      this.iu.detachSegment(this, refDoc);
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
      this.iu.childSegs.add(new_seg);
      for (let new_word of new_seg.words){
        new_word.seg = new_seg;
      }
      //add the new segment
      refDoc.segs.splice(refDoc.segs.indexOf(this)+1,0,new_seg);

      //set the disc flag
      this.iu.disc = true;
      // remove the unnecessary words
      this.words = this.words.slice(0,word_idx);

      //handle the single word
      refDoc.addGhostWord(delWord,this,"after");
    }
  }
}

export class IdeaUnit {
  label : string;           //IU label
  disc : boolean;           //discontinuous flag
  childSegs : Set<Segment>; //set of child segments

  //reference to document container
  linkedIus : string[];
  suggested : boolean;
  //color : string;

  constructor(label?: string, disc? : boolean){
    this.label = label || null;
    this.childSegs = new Set();
    this.disc = disc || null;
    this.linkedIus = [];
    this.suggested = false;
    //this.color = "Primary";
  }

  empty(): boolean {
    return this.label == null;
  }

  getText(): string{
    let res = "";
    for (let child of this.childSegs){
      res = res + " " + child.getText();
    }
    return res.trim();
  }

  detachSegment(delSeg: Segment, refDoc: IUCollection){
    delSeg.iu = null;
    switch (this.childSegs.size){
      case 1:{
        // the iu needs to be removed
        refDoc.removeIU(this.label);
        break;
      }
      case 2:{
        // the iu only has 2 segments.
        // by removing 1 it will stop being discontinuous
        this.childSegs.delete(delSeg);
        this.disc = false;
        break;
      }
      default:{
        this.childSegs.delete(delSeg);
        break;
      }
    }
  }

  addWord(word:Word, refDoc: IUCollection){
    word.remove(refDoc);
    //bookmark for the ghost structures
    let ghostIU = word.iu;
    let ghostSeg = word.seg;

    let adjWords : Word[] = [];
    for (var seg of this.childSegs){
      for (var w of seg.words){
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
        if (word.index > adjWords[0].index){
          //append word at the end of a segment
          adjWords[0].seg.words.push(word);
        }else{
          //append word at the start of a segment
          adjWords[0].seg.words.unshift(word);
        }

        break;
      }
      case 2:{
        //the word joins two existing segments
        //assign the segment to the left as master and delete the one on the right
        let master_seg : Segment;
        let del_seg : Segment;
        if (word.index > adjWords[0].index){
          master_seg = adjWords[0].seg;
          del_seg = adjWords[1].seg;
        }else{
          master_seg = adjWords[1].seg;
          del_seg = adjWords[0].seg;
        }
        //handle the single word
        word.iu = this.label;
        word.seg = master_seg;
        master_seg.words.push(word);
        //join the two segments
        for (w of del_seg.words){
          w.seg = master_seg;
          master_seg.words.push(w);
        }
        del_seg.iu.detachSegment(del_seg,refDoc);
        refDoc.removeSeg(del_seg);
        if (this.childSegs.size == 1){
          this.disc = false;
        }

        break;
      }
      default:{
        // the word is far away from the segments
        // ensure that the existing segments won't be ghosts any longer
        for (var s of this.childSegs){
          s.type = "default";
        }
        //create the new segment for the words far a way
        let new_seg : Segment = new Segment(refDoc);
        new_seg.words.push(word);
        new_seg.iu = this;
        word.seg = new_seg;
        word.iu = this.label;
        this.disc = true;
        this.childSegs.add(new_seg);
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
}

export class IUCollection {
  doc_name: string;
  doc_type: string;
  words: Word[];
  ius: Map<string, IdeaUnit>;
  segs: Segment[];
  sents: string[];

  max_seg_count : number;
  ghost_seg_count : number;
  manual_iu_count : number;

  constructor(){
    this.cleanup();
  }

  private cleanup(){
    this.ius = new Map<string, IdeaUnit>();
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
        cur_seg.words.push(temp_word);
        //link the segment to the word
        temp_word.seg = cur_seg;

        if (!this.ius.has(iu_label)){
          //console.log("iu not in memory");
          //creating an empty segment
          let temp_IU = new IdeaUnit(iu_label,read_word["disc"]);
          this.ius.set(iu_label,temp_IU);
        }
        //adding segment to IU structure
        let cur_IU = this.ius.get(iu_label);
        cur_IU["childSegs"].add(cur_seg);

        //adding IU references to a word and segment structure
        cur_seg.iu = cur_IU;
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
    word.seg = ghostSeg;
    word.iu = ghostIU.label;
    ghostIU.childSegs.add(ghostSeg);
    ghostSeg.words.push(word);
    ghostSeg.iu = ghostIU;

    //add structures to memory
    this.ius.set(ghostLabel,ghostIU);
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
    let iu = this.ius.get(iuLabel);
    for (var seg of iu.childSegs){
      this.removeSeg(seg);
    }
    this.ius.delete(iu.label);
  }

  //this function prepares a new JSON object and serializes it
  //necessary due to the circular references in my data structure
  jsonSerialize() : string {
    var json = {"doc_name" : this.doc_name,
                "doc_type" : this.doc_type };
    let tempIus = {};
    this.ius.forEach(function(iu, index) {
      //temp structure for array of words
      let tempSeg = []
      //explore the child segments
      for (var s of iu.childSegs){
        //extract the words from each segment
        for (var w of s.words){
          tempSeg.push(w.text);
        }
      }
      // associate the array of words to the iu index
      tempIus[index]=tempSeg;
    });

    json["ius"] = tempIus;
    return JSON.stringify(json);
  }

  findSegment(segIndex : number): Segment{
    return this.segs.find(seg => seg.index == segIndex);
  }
}
