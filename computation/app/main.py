""" FastAPI server """
from fastapi import FastAPI, File, UploadFile, Form, Response, status
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
import time

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
sources_col = db['sources']
sources_hist_col = db['sources_hist']
summaries_col = db['summaries']
summaries_hist_col = db['summaries_hist']


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


### USER DATA ###


def get_project(proj_id):
    res_proj = projects_col.find_one(proj_id)
    res_proj['sourceDoc'] = sources_col.find_one(res_proj['source_id'])
    res_proj['summaryDocs'] = []
    for sum_id in res_proj['summaries_id']:
        res_proj['summaryDocs'].append(summaries_col.find_one(sum_id))
    return res_proj


def new_summary(summary, proj_id, user_id):
    summary['user_id'] = user_id
    summary['project_id'] = proj_id
    summary['deleted'] = False
    summary['version'] = 0

    summary_hist = {
        # DB values
        'user_id': user_id,
        'project_id': proj_id,
        'history': [summary]
    }
    db_summary_hist_id = summaries_hist_col.insert_one(
        summary_hist).inserted_id

    summary['history_id'] = db_summary_hist_id
    db_summary_id = summaries_col.insert_one(summary).inserted_id
    return db_summary_id



@app.post("/v1/user/project/create", status_code=status.HTTP_201_CREATED)
async def create_proj(
        request: Request,
        response: Response,
        project: str = Form(...)):
    if not is_user_valid(request):
        # Guard against unauthenticated
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return False
    else:
        user = get_user_from_session(request)
        project_obj = loads(project)
        new_proj = {
            # DB values
            'user_id': user['_id'],
            'deleted': False,
            # JS values
            'name': project_obj['name'],
            'description': project_obj['description'],
            'creation_time': project_obj['creation_time'],
            'last_edit': project_obj['last_edit'],
        }
        db_proj_id = projects_col.insert_one(new_proj).inserted_id

        new_source = project_obj['sourceDoc']
        # DB values
        new_source['user_id'] = user['_id']
        new_source['project_id'] = db_proj_id
        new_source['deleted'] = False
        new_source['version'] = 0

        new_source_hist = {
            # DB values
            'user_id': user['_id'],
            'project_id': db_proj_id,
            'history': [new_source]
        }
        db_source_hist_id = sources_hist_col.insert_one(new_source_hist).inserted_id

        new_source['history_id'] = db_source_hist_id
        db_source_id = sources_col.insert_one(new_source).inserted_id

        new_summaries = project_obj['summaryDocs']
        db_summaries_ids = []
        for summary in new_summaries:
            db_summaries_ids.append(
                new_summary(summary, db_proj_id, user['_id']))

        projects_col.update_one(
            {
                "_id": db_proj_id,
            },
            {
                '$set':
                {
                    'source_id': db_source_id,
                    'summaries_id': db_summaries_ids
                }
            }
            )
        return convert_bson(get_project(db_proj_id))


@app.post("/v1/user/project/update")
async def update_proj(
        request: Request,
        project: str = Form(...)):
    project_obj = loads(project)
    user = get_user_from_session(request)
    pprint(user)
    pprint(project_obj)
    return {"received": True}


@app.post("/v1/user/project/delete")
async def delete_proj(
        request: Request,
        project: str = Form(...)):
    project_obj = loads(project)
    user = get_user_from_session(request)
    pprint(user)
    pprint(project_obj)
    return {"received": True}


@app.post("/v1/user/source/update")
async def update_source(
        request: Request,
        source_file: str = Form(...)):
    source = loads(source_file)
    user = get_user_from_session(request)
    pprint(user)
    pprint(source)
    return {"received": True}


@app.post("/v1/user/summary/create")
async def create_summary(
        request: Request,
        summary_file: str = Form(...)):
    summary = loads(summary_file)
    user = get_user_from_session(request)
    pprint(user)
    pprint(summary)
    return {"received": True}


@app.post("/v1/user/summary/update")
async def update_summary(
        request: Request,
        summary_file: str = Form(...)):
    summary = loads(summary_file)
    user = get_user_from_session(request)
    pprint(user)
    pprint(summary)
    return {"received": True}


@app.post("/v1/user/summary/delete")
async def delete_summary(
        request: Request,
        summary_file: str = Form(...)):
    summary = loads(summary_file)
    user = get_user_from_session(request)
    pprint(user)
    pprint(summary)
    return {"received": True}


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


def get_token_from_session(request):
    user = get_user_from_session(request)
    return user[user["cur_iss"]]


def is_about_to_expire(token):
    iat = int(token['iat'])  # issued time
    exp = int(token['exp'])  # expiry time
    # Refresh a token if at least 75% of its lifetime has elapsed
    expiry_treshold = int(iat + ((exp - iat) * 0.75))
    now = int(time.time())   # Current Unix Time in int
    return now > expiry_treshold


def is_user_valid(request: Request):
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

        # first check the keys
        session_set = set(token.keys())
        db_set = set(db_token.keys())
        res = (len(db_set.symmetric_difference(session_set)) == 0)

        # avoid this check if we already have a different set of keys
        if res is True:
            # check the values
            for key, value in db_token.items():
                res = res and value == token[key]

        # TODO: JWT validation here

        if res is True:
            # if I get here, then the session token is valid
            if (is_about_to_expire(token)):
                # refresh token if it is about to expire
                pass

    if res is False:
        # the user tampered with the session
        # break the session
        request.session.pop('user', None)

    return res


@app.get("/auth/identity")
async def logged_in(request: Request):
    res = False
    valid = is_user_valid(request)
    if valid is True:
        token = get_token_from_session(request)
        # prepare the decrypted printable data
        res = {
            'given_name': token['given_name'],
            'picture': token['picture'],
            'name': token['name'],
            'email': token['email'],
        }
    return res


@app.route('/auth/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')
