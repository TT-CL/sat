import { Injectable } from '@angular/core';
import { IUCollection } from './data-objects';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  sourceDoc : IUCollection;
  summaryDoc : IUCollection;

  setSource(source: IUCollection){
    this.sourceDoc = source;
  }

  setSummary(summary: IUCollection){
    this.summaryDoc = summary;
  }

  constructor() { }
}
