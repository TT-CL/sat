import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

const sampleSummaryURI: string = './samples/2.json';
const sampleSourceURI: string = './samples/source.json';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  constructor( private http: HttpClient ) {
  }

  private handleError(){
    console.log("Server Error");
  }

  getLabelledText(mode: string, text : File): Observable<HttpEvent<any>> {
    let url = "/computation/raw/"
    let formData = new FormData();
    formData.append('file', text);
    formData.append('doc_type', mode);

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  getSimPredictions(source : any, summary: any): Observable<HttpEvent<any>> {
    let url = "/computation/similarities/"
    let formData = new FormData();
    formData.append('source_file', source.jsonSerialize());
    formData.append('summary_file', summary.jsonSerialize());

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  /*
  getSampleSummary(): Observable<object> {
    return of(SampleSummary);
  }

  getSampleSource(): Observable<object> {
    return of(SampleSource);
  }
  */
}
