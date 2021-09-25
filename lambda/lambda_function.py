#!/usr/bin/env python3

from time import time
from keys import S3_INTERNAL, S3_PUBLIC, MASTER
from boto3 import resource
from utils import DynamoDB, CustomError, auth, generate_token, id7, id62, blake
from base64 import b64decode
from profiles import USERS
from lambdaAPI import LambdaAPI
from init_response import init_response

app = LambdaAPI()

def lambda_handler(event, _):
    return app.request(event)


@app.get("/init")
def init(post):
    auth(post["_access"], True)
    return init_response(post)


@app.post("/refresh")
def refresh(post):
    db = DynamoDB("tokens")
    res = db.get({"token": post["_refresh"]})
    if not res:
        raise CustomError(401, "無効なトークンです")
    secret = generate_token()
    db.delete({"token": post["_refresh"]})
    db.put({"token": secret["access"], "user_id": res["user_id"], "expired_at": int(time()) + 60*60})
    db.put({"token": secret["refresh"], "user_id": res["user_id"]})
    return secret


@app.get("/external/rtc/status")
def refresh(_):
    res = DynamoDB("status").get({"mode": "master"})
    return {
        "status": res["status"],
        "counts": int(res["counts"])
    }


@app.post("/external/rtc/status")
def refresh(post):
    if auth(post["_access"]) in MASTER:
        DynamoDB("status").put({
            "mode": "master",
            "status": post["status"],
            "counts": post["counts"]
        })


@app.invoked("/discord")
def discord(post):
    secret = generate_token()
    id = id7(int(post["id"]))
    if id not in USERS:
        raise CustomError(401, "無効なユーザーです")
    db = DynamoDB("tokens")
    db.put({"token": secret["access"], "user_id": id, "expired_at": int(time()) + 60*60})
    db.put({"token": secret["refresh"], "user_id": id})
    return { "id": id, "secret": secret }


@app.get("/notes/contents")
def get_note(post):
    auth(post["_access"])
    s3 = resource('s3').Bucket(S3_INTERNAL)
    obj = s3.Object(f'md/{post["note_id"]}.md')
    content = obj.get()['Body'].read().decode('utf-8')
    meta = DynamoDB("notes").get({"id": post["note_id"]})
    return {
        "permission": [],
        "content": content,
        "info": {
            "id": meta["id"],
            "updated_at": int(meta["updated_at"]),
            "title": meta["title"],
            "unread": False,
            "editable": meta["user_id"] == post["_id"],
        }
    }


@app.post("/notes/contents")
def post_note(post):
    auth(post["_access"])
    info = post["info"]
    DynamoDB("notes").put({
        "id": info["id"],
        "user_id": post["_id"],
        "title": info["title"],
        "roles": [],
        "updated_at": int(time())
    })
    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f'md/{info["id"]}.md',
        Body=post["content"],
        ContentType='text/plain',
    )


@app.post("/notes/assets")
def upload_img(post):
    auth(post["_access"])
    asset_id = blake(post["base64"])

    s3 = resource('s3').Bucket(S3_PUBLIC)
    if post["type"] == "jpg":
        s3.put_object(
            Key=f'note/jpg/{asset_id}.jpg',
            ACL="public-read",
            Body=b64decode(post["base64"].encode("UTF-8")),
            ContentType='image/jpg',
        )
    elif post["type"] == "mp3":
        s3.put_object(
            Key=f'note/mp3/{asset_id}.mp3',
            ACL="public-read",
            Body=b64decode(post["base64"].encode("UTF-8")),
            ContentType='audio/mp3',
        )
    return {"asset_id": asset_id}


@app.get("/notes/add")
def add_note(post):
    auth(post["_access"])
    note_id = id62()
    DynamoDB("notes").put({
        "id": note_id,
        "user_id": post["_id"],
        "title": "名称未設定",
        "roles": [],
        "updated_at": int(time())
    })
    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f'md/{note_id}.md',
        Body="",
        ContentType='text/plain',
    )
    return {"note_id": note_id}


@app.get("/notes/remove")
def remove_note(post):
    auth(post["_access"])
    DynamoDB("notes").delete({"id": post["note_id"]})
    resource("s3").Object(S3_INTERNAL, f"md/{post['note_id']}.md").delete()