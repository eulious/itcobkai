#!/usr/bin/env python3

from json import dumps
from keys import  KEYS, S3_INTERNAL, S3_PUBLIC, MASTER, DISCORD
from utils import id7, blake, CustomError
from boto3 import resource
from base64 import b64decode
from profiles import PROFILES
from datetime import datetime
from lambdaAPI import LambdaAPI

app = LambdaAPI()

def lambda_handler(event, _):
    return app.request(event)


@app.post("/discord", session=False, token=False)
def discord(post):
    try:
        import requests
        res = None
        data = {
            'client_id': DISCORD["CLIENT_ID"],
            'client_secret': DISCORD["CLIENT_SECRET"],
            'grant_type': 'authorization_code',
            'code': post["code"],
            'redirect_uri': post["redirect"]
        }
        headers = { "Content-Type": "application/x-www-form-urlencoded", }
        url = 'https://discord.com/api/v8/oauth2/token'
        res = requests.post(url, data=data, headers=headers).json()

        headers = { "Authorization": f"Bearer {res['access_token']}" }
        url = "https://discordapp.com/api/users/@me"
        res = requests.get(url, headers=headers).json()
    except: 
        raise CustomError(500, dumps(res))
    else:
        id = id7(int(res["id"]))
        if id in PROFILES:
            app.issue_session(id)
            return {"status": "ok"}
        else:
            raise CustomError(401, "無効なユーザーです")


@app.get("/token", token=False)
def token(_):
    return {"token": app.issue_token()}


@app.post("/submit", session=False, token=False)
def submit(post):
    date = datetime.now().strftime("%y%m%d_%H%M%S")
    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f"discord/{date}.json",
        ContentType='application/json',
        Body=dumps(post, indent=2, ensure_ascii=False)
    )
    return {"status": "ok"}


@app.get("/init")
def init(_):
    return {
        "profiles": PROFILES,
        "keys": KEYS,
        "id": app.id,
        "master": app.id in MASTER,
    }


@app.post("/status")
def post_status(post):
    if app.id not in MASTER:
        raise CustomError(500, f"許可されていません")
    s3 = resource('s3').Bucket(S3_PUBLIC)
    s3.put_object(
        Key='status.json',
        ACL="public-read",
        Body=dumps({
            "cnt": post["count"],
            "mtr": PROFILES[app.id]["name"]
        }, ensure_ascii=False),
        ContentType='application/json',
    )
    return {"status": "ok"}


@app.get("/notes")
def get_notes(_):
    mds = []
    client = resource('s3').meta.client
    res = client.list_objects_v2(Bucket=S3_INTERNAL, Prefix="md")
    for md in res["Contents"]:
        if ".md" not in md["Key"]:
            continue
        id = md["Key"].split("/")[1].split(".")[0]
        mds.append([id, md["LastModified"]])
    mds = sorted(mds, reverse=True, key=lambda x: x[1])
    return [md[0] for md in mds]


@app.get("/notes/contents")
def get_note(post):
    s3 = resource('s3').Bucket(S3_INTERNAL)
    obj = s3.Object(f'md/{post["id"]}.md')
    try:
        content = obj.get()['Body'].read().decode('utf-8')
        return {"content": content}
    except Exception as e:
        if "NoSuchKey" in str(type(e)):
            return {"content": ""}
        else:
            raise e


@app.post("/notes/contents")
def post_note(post):
    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f'md/{app.id}.md',
        Body=post["content"],
        ContentType='text/plain',
    )
    return {"status": "ok"}


@app.post("/notes/assets")
def upload_img(post):
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