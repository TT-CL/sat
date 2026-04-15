import { Injectable } from '@angular/core';
import { Observable, throwError, of, filter, map, tap, catchError} from 'rxjs';
import { IUCollection } from './objects/iu-collection';
import { StorageService } from './storage.service';
import { BackEndService } from './back-end.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NLPService {
  constructor(
    private storage: StorageService,
    private backend: BackEndService
  ){

  }
  parseRawIUCollection(file: File, mode: string): Observable<IUCollection> {
    if (file.type !== 'text/plain') {
      return throwError(() => new Error('Only .txt files are supported'));
    }
    const doc = new IUCollection();
    if (this.storage.offlineMode){
      // Do not segment IUs with backend
      doc.doc_name = file.name;
      doc.doc_type = mode;
      //TODO: parse raw text -> make function in iu-collection
      return of(doc)
    }else{
      // Parse the file with Spacy and create the doc structure
      return this.backend.getLabelledText(file, mode).pipe(
        filter(event => event.type === HttpEventType.Response),
        map((event: HttpResponse<any>) => {
          //console.log(event.body)
          console.log("event.body")
          console.log(event.body)
          doc.readDocument(event.body);
          console.log("doc")
          console.log(doc)
          return doc
        })
      );
    }
  }

  retrieveTokenizedSegs(doc: IUCollection, newSegments: string[]):Observable<IUCollection> {
    //console.log(this.newSegments);
    return this.backend.getTokenizedSegs(
      doc.doc_name, doc.doc_type, newSegments
    ).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        //console.log('${fName} is ${percentDone}% loaded.');
        }
      }),
      filter((event): event is HttpResponse<any> => event.type === HttpEventType.Response),
      map((event: HttpResponse<any>) => {
        const newDoc = new IUCollection();
        console.log(event.body);
        newDoc.readDocument(event.body);
        console.log(newDoc)
        return newDoc;
      }),
      catchError(err => {
        console.error("Error parsing manually edited segments: ", err);
        return throwError(() => err)
      }));
  }
}
