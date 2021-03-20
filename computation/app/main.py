""" FastAPI server """
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# from pydantic import BaseModel

from fastapi.responses import RedirectResponse, HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request

from src.data import import_file, prepare_json, prepare_man_segs_json
from src.glove import ModelWebWrapper
from src.extract import label_ius

from json_tricks import loads
from pprint import pprint

import os

from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.config import Config

from pymongo import MongoClient
import bson.json_util as bson
import json

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

# Retrieve DB environment variables
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
# Raise exception if no env variables are set
if(DB_NAME is None or DB_USER is None or DB_PASSWORD is None):
    raise Exception("No DB environment variables found")

DB_CONN = f'mongodb://{DB_USER}:{DB_PASSWORD}@db:27017/?authSource={DB_NAME}'
db_client = MongoClient(DB_CONN)
db = db_client[DB_NAME]
users_col = db['users']
projects_col = db['projects']


def convert_bson(data):
    return json.loads(bson.dumps(data))


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

app.add_middleware(
    ProxyHeadersMiddleware, trusted_hosts="*"
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


@app.post("/v1/man/segs")
async def tokenize_man_segs(
        doc_name: str = Form(...),
        doc_type: str = Form(...),
        segments: str = Form(...)):
    segs = loads(segments)
    json_data = prepare_man_segs_json(segs, doc_name, doc_type)
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
    # TODO: validate JWT
    # Query the DB for the user
    query = users_col.find_one({
        # each user has a dictionary of tokens, where the issuer is the key
        # and the token is the value
        # TODO: implement a search if I have another user with the same email
        # prompt user to join accounts with the same email
        "google.sub": user["sub"]
        })
    db_user = None
    if (query is None):
        # insert the user in the DB
        new_user = {
            'google': user,
        }
        db_user_id = users_col.insert_one(new_user).inserted_id
        # after an insert query the original object is updated with the id
        db_user = new_user
    else:
        db_user = query

    # set the current issuer as google
    db_user["cur_iss"] = "google"

    request.session['user'] = dict(convert_bson(db_user))
    return RedirectResponse(url='/logged-in')


def get_user_from_session(request):
    user = request.session['user']
    return bson.loads(json.dumps(user))


def validate_token(session_token, db_token):
    # first check the keys
    session_set = set(session_token.keys())
    db_set = set(db_token.keys())
    res = (len(db_set.symmetric_difference(session_set)) == 0)

    # speed up computation if the tokens don't have the same keys
    if res is True:
        # check the values
        for key, value in db_token.items():
            res = res and value == session_token[key]
    return res


@app.get("/auth/identity")
async def logged_in(request: Request):
    res = False
    if 'user' in request.session:
        user = get_user_from_session(request)

        # I only keep only one token connection, so I need to know which ISS
        # the user is using for Auth at this moment.
        # This will be useful when I have users with multiple login ISS
        cur_iss = user["cur_iss"]
        token = user[cur_iss]

        # check wheter I have this user in the DB
        # if not, the session data was tampered
        db_user = users_col.find_one(user["_id"])
        db_token = db_user[cur_iss]

        db_valid = validate_token(token, db_token)
        # TODO: add JWT validation here

        if db_valid is True:
            # prepare the decrypted printable data
            res = {
                'given_name': token['given_name'],
                'picture': token['picture'],
                'name': token['name'],
                'email': token['email'],
            }
        else:
            # the user tampered with the session
            request.session.pop('user', None)

    return res


@app.route('/auth/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')
