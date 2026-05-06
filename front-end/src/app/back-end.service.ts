import { Injectable } from '@angular/core';
import { Observable, of, throwError, filter, map } from 'rxjs';
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

  constructor(
    private http: HttpClient) {
  }

  getLabelledText(text : File, mode: string): Observable<HttpEvent<any>> {
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

  getProjects(): Observable<HttpEvent<any>>{
    console.log("getProjects")
    let url = "/api/v1/user/project/list";
    return this.http.get<any>(url, {
      observe: 'events',
      reportProgress: true
    });
    }

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

  createSummary(summary: IUCollection, project_id: string, silent_mode: boolean): Observable<HttpEvent<any>> {
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

  deleteProject(project: Project): Observable<HttpEvent<any>> {
    let url = "/api/v1/user/project/delete";

    let formData = new FormData();
    formData.append('project', JSON.stringify(project))

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
}