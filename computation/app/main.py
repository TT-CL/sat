from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.data import *
from src.glove import GloveDic
from src.extract import label_ius

from json_tricks import loads


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = GloveDic();

'''
@app.on_event("startup")
async def startup_event():
    model = GloveDic()
'''

@app.post("/raw/")
async def label_raw_text(doc_type: str = Form(...), file: UploadFile = File(...)):
    parsedFile = import_file(file.file)['spacy']
    label_ius(parsedFile)
    json_data =prepare_json(parsedFile,file.filename, doc_type)
    return json_data

@app.post("/lookup/word/")
async def lookup_word(word: str = Form(...), autocorrect: bool = Form(...)):
    result=model.lookup(word,autocorrect,http=True)
    return result

@app.post("/lookup/sent/")
async def lookup_word(sent: str = Form(...)):
    result=model.sentLookup(sent,http=True)
    return result

@app.post("/compute/similarities/")
async def lookup_word(
        source_file: str = Form(...),
        summary_file: str =Form(...)):
    source = loads(source_file)
    summary = loads(summary_file)
    print(source)
    print(summary)
    result = summary
    return result
