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
    if (this.storage.offlineMode_support){
      // Do not segment IUs with backend
      return this.parseIUCollectionOffline(file, mode);
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

  createOfflineIUCollection(docName: string, docType: string, text: string): IUCollection {
    // 1. Clean string
    const cleanedString = this.cleanOfflineString(text)

    // 2. Simple sentence splitting (periods, question marks, exclamation marks)
    const sentences = cleanedString
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(s => s.length > 0);

    // 3. Create JSON structure matching prepare_json()
    const jsonData: any = {
      doc_name: docName,
      doc_type: docType,
      sents: []
    };

    let wordIndex = 0;
    let maxIuIndex = 0;
    let sentenceIuIndex = 0;

    for (let sentIndex = 0; sentIndex < sentences.length; sentIndex++) {
      const sentence = sentences[sentIndex];
      
      // Each sentence gets its own IU index (no real IU labeling)
      sentenceIuIndex = ++maxIuIndex;
      
      // Simple word tokenization (split on whitespace, keep punctuation attached)
      const words = sentence
        .split(/\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 0);

      const sentData: any = { words: [] };

      for (const wordText of words) {
        sentData.words.push({
          text: wordText,
          word_index: wordIndex++,
          iu_index: sentenceIuIndex,
          iu_label: `SENT_${sentIndex}_${sentenceIuIndex}`, // Same IU label for entire sentence
          disc: false
        });
      }

      jsonData.sents.push(sentData);
    }

    // Create IUCollection and populate it
    const doc = new IUCollection();
    doc.readDocument(jsonData);

    return doc;
  }

    parseIUCollectionOffline(file: File, docType: string): Observable<IUCollection> {
    if (file.type !== 'text/plain') {
      return throwError(() => new Error('Only .txt files are supported'));
    }

    return new Observable<IUCollection>(observer => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const doc = this.createOfflineIUCollection(file.name, docType, text);
          observer.next(doc);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      reader.onerror = () => observer.error(new Error('Failed to read file'));
      reader.readAsText(file, 'utf-8');
    });
  }

cleanOfflineString(text: string): string {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line); // Ignore empty lines

  return lines.join(' ');
}

tokenizeSegmentWords(segment: string): string[] {
  const cleaned = this.cleanOfflineString(segment);

  if (!cleaned) {
    return [];
  }

  // Keeps punctuation as separate tokens, unlike simple whitespace split.
  // Examples: "hello, world!" -> ["hello", ",", "world", "!"]
  const matches = cleaned.match(/\w+(?:'\w+)?|[^\w\s]/g);
  return matches ?? [];
}

prepareManualSegmentJson(segment: string) {
  const tokens = this.tokenizeSegmentWords(segment);

  return {
    words: tokens.map((token, index) => ({
      text: token,
      word_index: index,
      iu_index: null,
      iu_label: 'MAN',
      disc: false
    }))
  };
}

createOfflineTokenizedSegs(
  docName: string,
  docType: string,
  segs: string[]
) {
  const data: any = {
    doc_name: docName,
    doc_type: docType,
    sents: []
  };

  let curIuIndex = 0;
  let wordIndex = 0;

  for (const rawSeg of segs) {
    const tokens = this.tokenizeSegmentWords(rawSeg);

    const sentData: any = {
      words: []
    };

    for (const token of tokens) {
      sentData.words.push({
        text: token,
        word_index: wordIndex,
        iu_index: curIuIndex,
        iu_label: 'MAN',
        disc: false
      });
      wordIndex += 1;
    }

    data.sents.push(sentData);
    curIuIndex += 1;
  }

  for (const sent of data.sents) {
    for (const word of sent.words) {
      word.disc = false;
    }
  }

  return data;
}

  retrieveTokenizedSegs(doc: IUCollection, newSegments: string[]):Observable<IUCollection> {
    if (this.storage.offlineMode_support) {
      try {
        const jsonData = this.createOfflineTokenizedSegs(
          doc.doc_name,
          doc.doc_type,
          newSegments
        );

        const newDoc = new IUCollection();
        newDoc.readDocument(jsonData);

        return of(newDoc);
      } catch (err) {
        console.error('Error parsing manually edited segments offline: ', err);
        return throwError(() => err);
      }
    }
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
