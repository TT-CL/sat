""" FastAPI server """
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

from fastapi.responses import RedirectResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.data import import_file, prepare_json
from src.glove import ModelWebWrapper
from src.extract import label_ius

from json_tricks import loads

import os

# get the gensim model URI from the environment variable
MODEL_URI = os.environ.get("GENSIM_MODEL")
# if no environment variable is specified, then use the default location
MODEL_URI = MODEL_URI if MODEL_URI else './models/gensim/model.bin'


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

model = ModelWebWrapper(MODEL_URI)

'''
@app.on_event("startup")
async def startup_event():
    flag = asyncio.Event()
    loader.run(flag)
    await flag  # Wait for the model to be loaded in memory
'''


@app.on_event("shutdown")
async def shutdown_event():
    # tell the wv server to flush the RAM
    with open('/tmp/wv_model_ram_pipe', 'w') as f:
        # print("writing to pipe")
        f.write("KILL\n")
        f.flush()
        f.close()


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    return RedirectResponse("/404")


@app.post("/v1/raw/")
async def label_raw_text(
        doc_type: str = Form(...),
        file: UploadFile = File(...)):
    parsedFile = import_file(file.file)['spacy']
    label_ius(parsedFile)
    json_data = prepare_json(parsedFile, file.filename, doc_type)
    return json_data


@app.post("/v1/lookup/word/")
async def lookup_word(word: str = Form(...), autocorrect: bool = Form(...)):
    result = model.lookup(word, autocorrect, http=True)
    return result


@app.post("/v1/lookup/sent/")
async def lookup_sent(sent: str = Form(...), autocorrect: bool = Form(...)):
    result = model.sentLookup(sent, autocorrect=autocorrect, http=True)
    return result


@app.post("/v1/lookup/sims/")
async def lookup_sims(sent1: str = Form(...), sent2: str = Form(...), autocorrect: bool = Form(...)):
    result = model.simsLookup(sent1, sent2, autocorrect=autocorrect, http=True)
    return result


@app.post("/v1/doc/sims/")
async def doc_sims(
        source_file: str = Form(...),
        summary_file: str = Form(...)):
    source = loads(source_file)
    summary = loads(summary_file)
    # print("source")
    # print(source)
    result = model.docSims(source, summary)
    return result
