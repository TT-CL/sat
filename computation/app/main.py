""" FastAPI server """
from fastapi import FastAPI, File, UploadFile, Form, Response, status
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# from pydantic import BaseModel

from fastapi.responses import RedirectResponse, HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request

from iuextract.data import import_file, prepare_json, __prepare_man_segs_json
from .src.glove import ModelWebWrapper
from iuextract.extract import label_ius

from json_tricks import loads
from pprint import pprint

import os
import time

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from firebase_admin.auth import ExpiredIdTokenError, RevokedIdTokenError, InvalidIdTokenError

import spacy

from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import bson.json_util as bson
import json
import urllib.parse


# get the gensim model URI from the environment variable
MODEL_URI = os.environ.get("GENSIM_MODEL")
# if no environment variable is specified, then use the default location
MODEL_URI = MODEL_URI if MODEL_URI else f'{(os.path.dirname(os.path.realpath(__file__)))}/models/gensim/model.bin'
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

escaped_user = urllib.parse.quote_plus(DB_USER)
escaped_pass = urllib.parse.quote_plus(DB_PASSWORD)

DB_CONN = f'mongodb://{escaped_user}:{escaped_pass}@db:27017/?authSource={DB_NAME}'
db_client = MongoClient(DB_CONN)
db = db_client[DB_NAME]
users_col = db['users']
projects_col = db['projects']
sources_col = db['sources']
sources_hist_col = db['sources_hist']
summaries_col = db['summaries']
summaries_hist_col = db['summaries_hist']

users_col.create_index([("firebase_uid", 1)], unique=True)

nlp = spacy.load("en_core_web_sm")

def convert_from_bson(data):
    return json.loads(bson.dumps(data))


def convert_to_bson(data):
    return bson.loads(json.dumps(data))


app = FastAPI(
    title="SAT API",
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


### AUTH ###

# Read the optional Firebase service account JSON path from the environment.
FIREBASE_SERVICE_ACCOUNT = f'{(os.path.dirname(os.path.realpath(__file__)))}/service_account.json'


bearer_scheme = HTTPBearer(auto_error=False)

if not firebase_admin._apps:
    if FIREBASE_SERVICE_ACCOUNT:
        firebase_admin.initialize_app(credentials.Certificate(FIREBASE_SERVICE_ACCOUNT))
    else:
        firebase_admin.initialize_app()

# Verify the Firebase token sent by Angular and return the decoded claims.
def get_current_firebase_claims(
    credentials_obj: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    # Reject the request immediately when the Authorization header is missing or when the scheme is not Bearer.
    if credentials_obj is None or credentials_obj.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    try:
        #Return the decoded claims
        return firebase_auth.verify_id_token(credentials_obj.credentials)
    except ExpiredIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired Firebase token")
    except RevokedIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Revoked Firebase token")
    except InvalidIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not verify Firebase token")

# Find the Mongo user that belongs to the verified Firebase user, or create it on first login.
def get_or_create_user_from_firebase(claims: dict):
  print(claims)
  firebase_uid = claims["uid"]

  db_user = users_col.find_one({"firebase_uid": firebase_uid})
  if db_user is not None:
      return users_col.find_one({"_id": db_user["_id"]})

  new_user = {
      "firebase_uid": firebase_uid,
      "email": claims.get("email"),
      "name": claims.get("name"),
      "picture": claims.get("picture"),
      "created_at": int(time.time()),
  }

  try:
      inserted_id = users_col.insert_one(new_user).inserted_id
      return users_col.find_one({"_id": inserted_id})
  except DuplicateKeyError:
      return users_col.find_one({"firebase_uid": firebase_uid})

def get_current_db_user(claims: dict = Depends(get_current_firebase_claims)):
    return get_or_create_user_from_firebase(claims)


def auth_check(document, current_user: dict):
  if (document is None):
    #If the document I'm trying to edit does not exist return an error
    raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The resource you are trying to modify does not exist",
        )
  if str(document["user_id"]) != str(current_user['_id']):
    #Raise an exception if the IDs don't match
    raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="Unauthorized"
      )


@app.post("/v1/raw")
async def label_raw_text(
        doc_type: str = Form(...),
        file: UploadFile = File(...)):
    file_contents = await file.read()
    text = file_contents.decode("utf-8")
    parsedFile = import_file(text, nlp=nlp)
    #print(parsedFile)
    label_ius(parsedFile)
    #print(type(parsedFile))
    #print(type(list(parsedFile.sents)[0]))
    #print(parsedFile[0])
    json_data = prepare_json(parsedFile, file.filename, doc_type)
    return json_data


@app.post("/v1/man/segs")
async def tokenize_man_segs(
        doc_name: str = Form(...),
        doc_type: str = Form(...),
        segments: str = Form(...)):
    #print(segments)
    segs = loads(segments)
    json_data = __prepare_man_segs_json(segs, doc_name, doc_type, nlp)
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
async def lookup_sims(
        sent1: str = Form(...),
        sent2: str = Form(...),
        autocorrect: bool = Form(...)):
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
        summary = summaries_col.find_one(sum_id)
        if not summary['deleted']:
            res_proj['summaryDocs'].append(summary)
    return res_proj


def new_summary(summary, proj_id, user_id):
    if '_id' in summary.keys():
        summary.pop('_id')
    summary['user_id'] = user_id
    summary['project_id'] = proj_id
    summary['deleted'] = False
    summary['version'] = 0

    summary_hist = {
        # DB values
        'user_id': user_id,
        'project_id': proj_id,
        'history': []
    }
    db_summary_hist_id = summaries_hist_col.insert_one(
        summary_hist).inserted_id

    summary['history_id'] = db_summary_hist_id
    db_summary_id = summaries_col.insert_one(summary).inserted_id

    db_summary = summaries_col.find_one(db_summary_id)
    db_summary['time'] = int(time.time())
    summaries_hist_col.update_one(
        {
            "_id": db_summary_hist_id,
        },
        {
            '$push':
            {
                'history': db_summary,
            }
        }
    )
    return db_summary_id


@app.get("/v1/user/project/list", status_code=status.HTTP_200_OK)
async def get_project_list(current_user: dict = Depends(get_current_db_user)):
    projects = projects_col.find({
        "user_id": {"$eq": current_user['_id']}
    })

    projects_obj = []
    for p in projects:
        if p['deleted'] is False:
            projects_obj.append(get_project(p['_id']))

    return convert_from_bson(projects_obj)


@app.post("/v1/user/project/create", status_code=status.HTTP_201_CREATED)
async def create_proj(
        current_user: dict = Depends(get_current_db_user),
        project: str = Form(...)):
    project_obj = bson.loads(project)
    # defaults for optional parameters
    description = None
    if 'description' in project_obj.keys():
        description = project_obj['description']
    new_proj = {
        # DB values
        'user_id': current_user['_id'],
        'deleted': False,
        # JS values
        'name': project_obj['name'],
        'description': description,
        'creation_time': project_obj['creation_time'],
        'last_edit': project_obj['last_edit'],
    }
    db_proj_id = projects_col.insert_one(new_proj).inserted_id

    new_source = project_obj['sourceDoc']
    # DB values
    new_source['user_id'] = current_user['_id']
    new_source['project_id'] = db_proj_id
    new_source['deleted'] = False
    new_source['version'] = 0
    # pop the id if it exists
    if '_id' in new_source.keys():
        new_source.pop('_id')

    new_source_hist = {
        # DB values
        'user_id': current_user['_id'],
        'project_id': db_proj_id,
        'history': [new_source]
    }
    db_source_hist_id = sources_hist_col.insert_one(
        new_source_hist).inserted_id

    new_source['history_id'] = db_source_hist_id
    db_source_id = sources_col.insert_one(new_source).inserted_id

    # Summary docs are optional, provide a default empty array
    new_summaries = []
    if "summaryDocs" in project_obj.keys():
        new_summaries = project_obj['summaryDocs']
    db_summaries_ids = []
    for summary in new_summaries:
        db_summaries_ids.append(
            new_summary(summary, db_proj_id, current_user['_id']))

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
    return convert_from_bson(get_project(db_proj_id))


@app.post("/v1/user/project/update", status_code=status.HTTP_200_OK)
async def update_proj(
        current_user: dict = Depends(get_current_db_user),
        project: str = Form(...)):
    project_obj = bson.loads(project)
    db_proj = projects_col.find_one(project_obj['_id'])
    auth_check(db_proj, current_user)

    # Proceed with the update
    projects_col.update_one(
        {
            "_id": db_proj['_id'],
        },
        {
            '$set':
            {
                'name': project_obj['name'],
                'description': project_obj['description'],
                'last_edit': project_obj['last_edit'],
            }
        }
    )
    return True


@app.post("/v1/user/project/delete", status_code=status.HTTP_200_OK)
async def delete_proj(
        current_user: dict = Depends(get_current_db_user),
        project: str = Form(...)):
    project_obj = bson.loads(project)
    db_proj = projects_col.find_one(project_obj['_id'])
    auth_check(db_proj, current_user)

    # Proceed with the deletion
    projects_col.update_one(
        {
            "_id": db_proj['_id'],
        },
        {
            '$set':
            {
                'deleted': True,
                'deleted_time': int(time.time()),
            }
        }
    )
    return True


@app.post("/v1/user/source/update", status_code=status.HTTP_200_OK)
async def update_source(
        current_user: dict = Depends(get_current_db_user),
        source: str = Form(...),
        silent_mode: str = Form(...)):
    silent = json.loads(silent_mode)
    source_obj = bson.loads(source)
    db_source = sources_col.find_one(source_obj['_id'])
    auth_check(db_source, current_user)

    # Update source
    sources_col.update_one(
        {
            "_id": db_source['_id'],
        },
        {
            '$set':
            {
                'doc_name': source_obj['doc_name'],
                'doc_type': source_obj['doc_type'],
                'ius': source_obj['ius'],
                'manual_iu_count': source_obj['manual_iu_count'],
                'max_connected_idx': source_obj['max_connected_idx'],
                'max_disc_idx': source_obj['max_disc_idx'],
                'max_seg_count': source_obj['max_seg_count'],
                'segs': source_obj['segs'],
                'sents': source_obj['sents'],
                'words': source_obj['words'],
                'version': db_source['version'] + 1,
            }
        }
    )
    # update history
    cur_db_source = sources_col.find_one(db_source['_id'])
    cur_db_source['time'] = int(time.time())
    sources_hist_col.update_one(
        {
            "_id": cur_db_source['history_id'],
        },
        {
            '$push':
            {
                'history': cur_db_source,
            }
        }
    )
    if silent:
        return True
    else:
        return convert_from_bson(cur_db_source)


@app.post("/v1/user/summary/create", status_code=status.HTTP_201_CREATED)
async def create_summary(
        current_user: dict = Depends(get_current_db_user),
        project_id: str = Form(...),
        summary: str = Form(...),
        silent_mode: str = Form(...)):
    silent = json.loads(silent_mode)
    summary_obj = bson.loads(summary)
    project_id_obj = bson.loads(project_id)
    db_proj = projects_col.find_one(project_id_obj)
    auth_check(db_proj, current_user)

    # Create summary
    db_summary_id = new_summary(summary_obj, db_proj['_id'], current_user['_id'])

    projects_col.update_one(
        {
            "_id": db_proj['_id'],
        },
        {
            '$push':
            {
                'summaries_id': db_summary_id,
            }
        }
    )
    if silent:
        return True
    else:
        db_summary = summaries_col.find_one(db_summary_id)
        return convert_from_bson(db_summary)


@app.post("/v1/user/summary/update", status_code=status.HTTP_200_OK)
async def update_summary(
        current_user: dict = Depends(get_current_db_user),
        summary: str = Form(...),
        silent_mode: str = Form(...)):

    silent = json.loads(silent_mode)
    summary_obj = bson.loads(summary)
    db_summary = summaries_col.find_one(summary_obj['_id'])
    auth_check(db_summary, current_user)
    # Update source
    summaries_col.update_one(
        {
            "_id": db_summary['_id'],
        },
        {
            '$set':
            {
                'doc_name': summary_obj['doc_name'],
                'doc_type': summary_obj['doc_type'],
                'ius': summary_obj['ius'],
                'manual_iu_count': summary_obj['manual_iu_count'],
                'max_connected_idx': summary_obj['max_connected_idx'],
                'max_disc_idx': summary_obj['max_disc_idx'],
                'max_seg_count': summary_obj['max_seg_count'],
                'segs': summary_obj['segs'],
                'sents': summary_obj['sents'],
                'words': summary_obj['words'],
                'version': db_summary['version'] + 1,
            }
        }
    )
    # update history
    cur_db_summary = summaries_col.find_one(db_summary['_id'])
    cur_db_summary['time'] = int(time.time())
    summaries_hist_col.update_one(
        {
            "_id": cur_db_summary['history_id'],
        },
        {
            '$push':
            {
                'history': cur_db_summary,
            }
        }
    )
    if silent:
        return True
    else:
        return convert_from_bson(cur_db_summary)


@app.post("/v1/user/summary/delete", status_code=status.HTTP_200_OK)
async def delete_summary(
        current_user: dict = Depends(get_current_db_user),
        summary_id: str = Form(...)):
    ram_sum_id = bson.loads(summary_id)
    db_summary = summaries_col.find_one(ram_sum_id)
    auth_check(db_summary, current_user)
      

    # Update summary
    summaries_col.update_one(
        {
            "_id": db_summary['_id'],
        },
        {
            '$set':
            {
                'deleted': True,
                'deleted_time': int(time.time())
            }
        }
    )
    # update history
    cur_db_summary = summaries_col.find_one(db_summary['_id'])
    cur_db_summary['time'] = int(time.time())
    summaries_hist_col.update_one(
        {
            "_id": cur_db_summary['history_id'],
        },
        {
            '$push':
            {
                'history': cur_db_summary,
            }
        }
    )
    return True