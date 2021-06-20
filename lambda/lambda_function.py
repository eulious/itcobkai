#!/usr/bin/env python3

from time import time
from base64 import b64decode
from keys import KEYS
from utils import CustomError, db, id62, s3, auth
from discord import Discord
from lambdaAPI import LambdaAPI

app = LambdaAPI()

def lambda_handler(event, context):
    return app.debug(event)
    # return app.request(event)


@app.get("init")
def init(params):
    if not params["token"]:
        raise CustomError("トークンがありません")
    items = db("itcobkai").scan()["Items"]
    flag = False
    profiles = {}
    for item in items:
        if auth(params["token"], item):
            flag = True
        profiles[item["id"]] = item["profile"]
    if flag:
        return {"profiles": profiles, "keys": KEYS}
    else:
        raise CustomError("無効なトークンです")


@app.post("init")
def init(params):
    dc = Discord()
    if "refresh" in params["post"]:
        discord = dc.refresh(params["post"]["refresh"])
        access_token = discord["access"]
    else:
        discord = None
        access_token = params["post"]["access"]
    user = dc.user(access_token)
    
    items = db("itcobkai").scan()["Items"]
    profiles = {}
    for item in items:
        profile = item["profile"]
        profiles[item["id"]] = profile
        if user["id"] == item["id"] and (user["name"] != profile["name"] or user["thumbnail"] != profile["thumbnail"]):
            profile["name"] = user["name"]
            profile["thumbnail"] = user["thumbnail"]
            db("itcobkai").put_item( Item={ "id": item["id"], "profile": profile,"secret": item["secret"] })
    return {"profiles": profiles, "keys": KEYS, discord: discord}


@app.get("users")
def get_user(params):
    if not auth(params["token"]):
        raise CustomError("無効なトークンです")

    res = db("itcobkai").get_item(Key={"id": params["get"]["id"][0]})
    if "Item" not in res:
        raise CustomError("無効なトークンです")
    else:
        return res["Item"]["profile"]


@app.get("refresh")
def refresh(params):
    id, token = params["token"].split("-")
    res = db("itcobkai").get_item(Key={"id": id})
    if "Item" in res and res["Item"]["secret"]["refresh"] == token:
        item = res["Item"]
        item["secret"]["access"] = id62()
        item["secret"]["expiration"] = int(time())
        db("itcobkai").put_item(Item=item)
        return item["secret"]["access"]
    else:
        raise CustomError("無効なトークンです")


@app.get("signup")
def signup(params):
    post = params["post"]

    if post["base64"]:
        h = id62()
        s3.put_object(
            Key=f"assets/thumb/{h}.jpg",
            ACL="public-read",
            Body=b64decode(post.pop("base64").encode("UTF-8")),
            ContentType='image/jpg',
        )
    elif post["thumbnail"]:
        h = post["thumbnail"]
    else:
        h = "1ea87b3d45bcf71f694ff4b6485d136e"

    secret = {
        "access": id62(),
        "refresh": id62(),
        "expiration": int(time())
    }
    
    db("itcobkai").put_item( Item={ "id": id, "profile": post, "secret": secret })
    return {"secret": secret}


@app.post("code")
def convert_code(params):
    dc = Discord()
    d = dc.get_token(params["post"]["code"], params["post"]["redirect"])
    return {"discord":d, "users": dc.user(d["access"]), "guild": dc.guild(d["access"])}