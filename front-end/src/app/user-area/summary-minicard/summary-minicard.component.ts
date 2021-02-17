import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-summary-minicard',
  templateUrl: './summary-minicard.component.html',
  styleUrls: ['./summary-minicard.component.sass']
})
export class SummaryMinicardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() file : File;

  @Output() close = new EventEmitter<File>();

}
