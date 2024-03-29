import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { last } from 'rxjs/operators';

import * as XLSX from 'xlsx';

import { AuthService } from './auth.service';

import { IUCollection, Project } from './objects/objects.module';

@Injectable({
  providedIn: 'root'
})
export class ExporterService {

  constructor(
    private auth: AuthService,
    private sanitizer: DomSanitizer,
  ) {
    auth.getName().subscribe(name=>{
      this.userFullName = name;
    })
  }
  userFullName: string;

  async generateProjectSpreadsheet(proj: Project){
    // Create workbook and write props
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    if(!wb.Props) wb.Props = {};
    wb.Props.Title = proj.name;
    wb.Props.Subject = proj.description
    wb.Props.Author = this.userFullName;
    wb.Props.CreatedDate = new Date();

    // append summary docs worksheets
    proj.summaryDocs.map(summary => {
      wb.SheetNames.push(summary.doc_name);
      var ws = XLSX.utils.aoa_to_sheet(
        summary.prepareWorksheet(proj.sourceDoc));
      wb.Sheets[summary.doc_name] = ws;
    });
    // append source document worksheet
    wb.SheetNames.push(proj.sourceDoc.doc_name);
    var ws = XLSX.utils.aoa_to_sheet(
      proj.sourceDoc.prepareWorksheet());
    wb.Sheets[proj.sourceDoc.doc_name] = ws;

    XLSX.writeFile(wb, proj.name + '.xlsx', { bookType: 'xlsx' });
  }

  async generatedDocSpreadsheet(doc: IUCollection) {
    // Create workbook and write props
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    if (!wb.Props) wb.Props = {};
    wb.Props.Title = doc.doc_name;
    wb.Props.Subject = doc.doc_type;
    wb.Props.Author = this.userFullName;
    wb.Props.CreatedDate = new Date();

    // append a document worksheet
    wb.SheetNames.push(doc.doc_name);
    var ws = XLSX.utils.aoa_to_sheet(doc.prepareWorksheet());
    wb.Sheets[doc.doc_name] = ws;

    XLSX.writeFile(wb, doc.doc_name + '.xlsx', { bookType: 'xlsx' });
  }

  generateProjectJsonURI(proj: Project){
    let obj = JSON.stringify(proj);
    return this.sanitizer.bypassSecurityTrustUrl("data:application/json;charset=UTF-8," + encodeURIComponent(obj));
  }
}
