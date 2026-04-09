import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import * as ExcelJS from 'exceljs';

import { AuthService } from './auth.service';
import { IUCollection, Project } from './objects/objects.module';

@Injectable({
  providedIn: 'root'
})
export class ExporterService {
  userFullName: string = '';

  constructor(
    private auth: AuthService,
    private sanitizer: DomSanitizer,
  ) {
    this.auth.getName().subscribe(name => {
      this.userFullName = name;
    });
  }

  private async saveWorkbook(workbook: ExcelJS.Workbook, fileName: string): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    console.log("buffer")
    const blob = new Blob(
      [buffer],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private safeSheetName(name: string): string {
    return (name || 'Sheet')
      .replace(/[:\\/?*\[\]]/g, '_')
      .slice(0, 31);
  }

  private addWorksheetFromAoA(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    rows: any[][]
  ): void {
    const worksheet = workbook.addWorksheet(this.safeSheetName(sheetName));
    rows.forEach(row => worksheet.addRow(row));
  }

  async generateProjectSpreadsheet(proj: Project): Promise<void> {
    if (!proj) {
    console.error('generateProjectSpreadsheet: proj is null');
    return;
    }

    console.log('Project:', proj);
    const wb = new ExcelJS.Workbook();

    wb.creator = this.userFullName || 'SAT User';
    wb.created = new Date();
    wb.modified = new Date();
    wb.subject = proj.description || '';
    wb.title = proj.name || 'SAT project';

    proj.summaryDocs.forEach(summary => {

    console.log('Generating summary worksheet:', summary.doc_name);
      this.addWorksheetFromAoA(
        wb,
        summary.doc_name,
        summary.prepareWorksheet(proj.sourceDoc)
      );
    });

    this.addWorksheetFromAoA(
      wb,
      proj.sourceDoc.doc_name,
      proj.sourceDoc.prepareWorksheet()
    );
    console.log(wb)
    await this.saveWorkbook(wb, `${proj.name}.xlsx`);
  }

  async generatedDocSpreadsheet(doc: IUCollection): Promise<void> {
    const wb = new ExcelJS.Workbook();

    wb.creator = this.userFullName;
    wb.created = new Date();
    wb.modified = new Date();
    wb.subject = doc.doc_type;
    wb.title = doc.doc_name;

    this.addWorksheetFromAoA(
      wb,
      doc.doc_name,
      doc.prepareWorksheet()
    );

    await this.saveWorkbook(wb, `${doc.doc_name}.xlsx`);
  }

  generateProjectJsonURI(proj: Project) {
    const obj = JSON.stringify(proj);
    return this.sanitizer.bypassSecurityTrustUrl(
      'data:application/json;charset=UTF-8,' + encodeURIComponent(obj)
    );
  }
}