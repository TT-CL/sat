""" FastAPI server """
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

from fastapi.responses import RedirectResponse, HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request

from src.data import import_file, prepare_json
from src.glove import ModelWebWrapper
from src.extract import label_ius

from json_tricks import loads

import os

from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.config import Config

config = Config('.env')
oauth = OAuth(config)
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# get the gensim model URI from the environment variable
MODEL_URI = os.environ.get("GENSIM_MODEL")
# if no environment variable is specified, then use the default location
MODEL_URI = MODEL_URI if MODEL_URI else './models/gensim/model.bin'

# get a secret key from the env variables
SECRET_KEY = os.environ.get("SECRET_KEY")
# if no environment variable is specified, then use random-string-12345
SECRET_KEY = SECRET_KEY if SECRET_KEY else 'random-string-12345'

app = FastAPI(
    title="Summary Eval API",
    version="v1",
    root_path="/api",
)

origins = [
    "http://localhost",
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware, secret_key=SECRET_KEY
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


@app.post("/v1/raw")
async def label_raw_text(
        doc_type: str = Form(...),
        file: UploadFile = File(...)):
    parsedFile = import_file(file.file)['spacy']
    label_ius(parsedFile)
    json_data = prepare_json(parsedFile, file.filename, doc_type)
    return json_data


@app.post("/v1/lookup/word")
async def lookup_word(word: str = Form(...), autocorrect: bool = Form(...)):
    result = model.lookup(word, autocorrect, http=True)
    return result


@app.post("/v1/lookup/sent")
async def lookup_sent(sent: str = Form(...), autocorrect: bool = Form(...)):
    result = model.sentLookup(sent, autocorrect=autocorrect, http=True)
    return result


@app.post("/v1/lookup/sims")
async def lookup_sims(sent1: str = Form(...), sent2: str = Form(...), autocorrect: bool = Form(...)):
    result = model.simsLookup(sent1, sent2, autocorrect=autocorrect, http=True)
    return result


@app.post("/v1/doc/sims")
async def doc_sims(
        source_file: str = Form(...),
        summary_file: str = Form(...)):
    source = loads(source_file)
    summary = loads(summary_file)
    # print("source")
    # print(source)
    result = model.docSims(source, summary)
    return result


### AUTH ###


@app.get("/login/google")
async def login_via_google(request: Request):
    redirect_uri = request.url_for('auth_via_google')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google")
async def auth_via_google(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        return HTMLResponse(f'<h1>{error.error}</h1>')
    user = await oauth.google.parse_id_token(request, token)
    request.session['user'] = dict(user)
    return RedirectResponse(url='/')


@app.get("/auth/identity")
async def logged_in(request: Request):
    res = False
    if 'user' in request.session:
        user = request.session['user']
        res = {
            'given_name': user['given_name'],
            'avatar': user['picture']
        }
    return res


@app.route('/auth/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/projects')
