import { Component, OnInit, OnChanges, Input, SimpleChanges} from '@angular/core';

@Component({
  selector: 'iu-display',
  templateUrl: './iu-display.component.html',
  styleUrls: ['./iu-display.component.sass']
})
export class IuDisplayComponent implements OnInit {

  @Input() segs: object[];
  @Input() words: object;
  @Input() getSegText: string;

  constructor() {
  }

  ius : Object[] = [];

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      /*
      const chng = changes[propName];
      const cur  = JSON.stringify(chng.currentValue);
      const prev = JSON.stringify(chng.previousValue);
      console.log(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
      console.log("b");
      */
      if (propName == "segs"){

        console.log("iu_chip - seg")






        /**
        let cur_iu : Object = {
          'text' : ''
        };
        let cur_idx : string = null;
        for (var word of this.sent["words"]) {
          if (cur_idx !== word.iu_index && cur_idx !== null){
            this.ius.push(cur_iu);
            cur_idx = word.iu_index;
            cur_iu["text"] = word.text;
          }else{
            let spacer: string = " ";
            let punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
            if (punctuation.includes(word.text)){
              spacer = "";
            }
            cur_iu["text"] = cur_iu["text"] + spacer + word.text;
            cur_idx = word.iu_index;
          }
        }

        for (var iu of this.ius) {
          console.log(iu)
        }
        */
      }
    }
  }

  ngOnInit(): void {
  }
}
