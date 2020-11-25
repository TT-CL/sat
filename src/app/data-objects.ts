const punctuation : string = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export class Word {
  text : string;
  color : string;     //mat-color property
  iu : IdeaUnit;      //parent iu
  seg : Segment;      //parent segment
  selected : boolean; //html selected property

  constructor(text: string){
    this.text = text;
    this.color = "primary";
    this.selected = true;
  }
}

export class Sent {
  words : Word[];
  constructor(){
    this.words = [];
  }

  getText() : string {
    let res : string = ""

    for (let word of this.words){
      let spacer: string = " ";
      if (punctuation.includes(word.text)){
        spacer = "";
      }
      res = res + spacer + word.text;
    }
    return res.trim();
  }
}

export class Segment {
  words: Word[];      //array of child words
  iu : IdeaUnit;      //the parent iu
  selected: boolean;  //html selected property

  constructor(){
    this.words = [];
    this.selected = false;
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
    if (printIuLabel){
      if (this.iu.disc){
        res = this.iu.label + "|" + res;
      }
    }
    return res.trim();
  }
}

export class IdeaUnit {
  label: string;      //IU label
  disc : boolean;     //discontinuous flag
  childSegs : Set<Segment>; //set of child segments

  constructor(label: string, disc : boolean){
    this.label = label;
    this.childSegs = new Set();
    this.disc = disc;
  }
}

export class IUCollection {
  ius: Map<string, IdeaUnit>;
  segs: Segment[];
  sents: Sent[];
  words: Word[];
  doc_name: string;
  doc_type: string;

  constructor(){
    this.cleanup();
  }

  private cleanup(){
    this.ius = new Map<string, IdeaUnit>();
    this.segs = [];
    this.sents = [];
    this.words = [];
  }

  private parseFile(text: object){
    console.log(text);
    this.doc_name = text["doc_name"];
    this.doc_type = text["doc_type"];

    //seg boundary spy
    let prev_label : string = "";
    for (var read_sent of text["sents"]){
      //initializing Sent object
      let temp_sent : Sent = new Sent();
      for (var read_word of read_sent["words"]){
        //initializing Word object
        let temp_word : Word = new Word(read_word["text"]);

        //automatically generated IUs are prefixed with the "a" letter
        let iu_label = "a" + read_word["iu_index"];
        //boundary check
        if (iu_label != prev_label){
          //console.log("boundary");
          prev_label = iu_label;
          //creating an empty segment
          let temp_seg = new Segment();
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
        temp_word.iu = cur_IU;

        //adding Word object to memory
        temp_sent.words.push(temp_word);
        this.words.push(temp_word);
      }
      //adding Sent object to memory
      this.sents.push(temp_sent);
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
      resText = resText + "\n" + sent.getText();
    }
    return resText.trim();
  }
}
