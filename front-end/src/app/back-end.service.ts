import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { IUCollection, Project } from './objects/objects.module';

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
  
  updateSource(source: IUCollection, silent_mode: boolean): Observable<HttpEvent<any>> {
    let url = "/api/v1/user/source/update";

    let formData = new FormData();
    formData.append('source', JSON.stringify(source))
    formData.append('silent_mode', JSON.stringify(silent_mode))

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  updateSourceSilent(source: IUCollection): void {
    this.updateSource(source, true).subscribe(
      event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          //console.log('${fName} is ${percentDone}% loaded.');
        } else if (event instanceof HttpResponse) {
          //console.log("ok!")
        }
      },
      (err) => {
        console.log("Error updating the work source:", err);
      }, () => {
        //console.log("Work source updated successfully");
      });
  }

  createSummary(summary: IUCollection, project_id, silent_mode: boolean): Observable<HttpEvent<any>> {
    let url = "/api/v1/user/summary/create";

    let formData = new FormData();
    formData.append('project_id', JSON.stringify(project_id))
    formData.append('summary', JSON.stringify(summary))
    formData.append('silent_mode', JSON.stringify(silent_mode))

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  updateSummary(summary: IUCollection, silent_mode: boolean): Observable<HttpEvent<any>> {
    let url = "/api/v1/user/summary/update";

    let formData = new FormData();
    formData.append('summary', JSON.stringify(summary))
    formData.append('silent_mode', JSON.stringify(silent_mode))

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  updateSummarySilent(summary: IUCollection): void{
    this.updateSummary(summary, true).subscribe(
      event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          //console.log('${fName} is ${percentDone}% loaded.');
        } else if (event instanceof HttpResponse) {
          //console.log("ok!")
        }
      },
      (err) => {
        console.log("Error updating the work summary:", err);
      }, () => {
        //console.log("Work summary updated successfully");
      });
  }

  deleteSummary(summary: IUCollection): Observable<HttpEvent<any>> {
    let url = "/api/v1/user/summary/delete";

    let formData = new FormData();
    formData.append('summary_id', JSON.stringify(summary._id))

    const options = {
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);

    return this.http.request(req);
  }

  updateProject(project: Project): Observable<HttpEvent<any>> {
    let url = "/api/v1/user/project/update";

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
