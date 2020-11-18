import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import SampleSummary from './samples/2.json';
import SampleSource from './samples/source.json';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  file: Object = null;

  setFile(file): void {
    this.file = file
  }

  constructor() { }

  getSummary(): Observable<object> {
    return of(SampleSummary);
  }

  getSource(): Observable<object> {
    return of(SampleSource);
  }
}
