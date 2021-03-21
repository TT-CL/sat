import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Project } from './objects/objects.module';

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
    let url = "/api/v1/raw"
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
    let url = "/api/v1/doc/sims"
    let formData = new FormData()
    //console.log("Source vs stringified")
    //console.log(source)
    formData.append('source_file', JSON.stringify(source))
    formData.append('summary_file', JSON.stringify(summary))

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  getTokenizedSegs(doc_name: string, doc_type: string, segs: Array<string>): Observable<HttpEvent<any>> {
    let url = "/api/v1/man/segs"
    let formData = new FormData()
    //console.log("Doc_name")
    //console.log(doc_name)
    formData.append('doc_name', doc_name)
    formData.append('doc_type', doc_type)
    formData.append('segments', JSON.stringify(segs))

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

  // CRUD METHODS TO KEEP THE DB UP TO DATE

  createProject(project: Project): Observable<HttpEvent<any>>{
    let url = "/api/v1/user/project/create";

    let formData = new FormData();
    formData.append('project', JSON.stringify(project))

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }
 
  /**
  createProject(project: Project){
    let url = "/api/user/project/create";

    let formData = new FormData();
    formData.append('project', JSON.stringify(Project))

    fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(() => console.log("Created new Project"));
  }
  */
}
