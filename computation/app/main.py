from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.data import *
from src.extract import label_ius


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

class TextFile(BaseModel):
    name: str
    type: str #Summary/Source
    data: str


@app.get("/")
def read_root():
    return {"Ciao": "Mondo"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/raw/")
async def label_raw_text(doc_type: str, file: UploadFile = File(...)):
    parsedFile = import_file(file.file)['spacy']
    label_ius(parsedFile)
    json_data =prepare_json(parsedFile,file.filename, doc_type)
    return json_data
