
import { Component, OnInit } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.sass'],
    standalone: true,
    imports: [
    MarkdownModule
]
})
export class GuideComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
