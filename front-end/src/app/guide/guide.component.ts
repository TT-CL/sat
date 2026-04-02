import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.sass'],
    standalone: true,
    imports:[
      CommonModule,
      MarkdownModule
    ]
})
export class GuideComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
