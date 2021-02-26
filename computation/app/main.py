""" FastAPI server """
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
#from pydantic import BaseModel

from fastapi.responses import RedirectResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.data import import_file, prepare_json
from src.glove import GloveDic
from src.extract import label_ius

from json_tricks import loads


app = FastAPI(
    title="Summary Eval API",
    version="v1",
    openapi_url="/docs/openapi.json",
)

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

model = GloveDic()

'''
@app.on_event("startup")
async def startup_event():
    model = GloveDic()
'''

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    return RedirectResponse("/404")

@app.post("/v1/raw/")
async def label_raw_text(doc_type: str = Form(...), file: UploadFile = File(...)):
    parsedFile = import_file(file.file)['spacy']
    label_ius(parsedFile)
    json_data =prepare_json(parsedFile,file.filename, doc_type)
    return json_data

@app.post("/v1/lookup/word/")
async def lookup_word(word: str = Form(...), autocorrect: bool = Form(...)):
    result=model.lookup(word,autocorrect,http=True)
    return result

@app.post("/v1/lookup/sent/")
async def lookup_sent(sent: str = Form(...)):
    result=model.sentLookup(sent,http=True)
    return result

@app.post("/v1/similarities/")
async def lookup_sims(
        source_file: str = Form(...),
        summary_file: str =Form(...)):
    source = loads(source_file)
    summary = loads(summary_file)
    #print("source")
    #print(source)
    result = model.calcSims(source, summary)
    return result
