import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class BackEndService {

  constructor( private http: HttpClient ) {
  }

  private handleError(){
    console.log("Server Error");
  }

  getLabelledText(mode: string, text : File): Observable<HttpEvent<any>> {
    let url = "/api/v1/raw/"
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
    let url = "/api/v1/doc/sims/"
    let formData = new FormData()
    console.log("Source vs stringified")
    console.log(source)
    formData.append('source_file', JSON.stringify(source))
    formData.append('summary_file', JSON.stringify(summary))

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