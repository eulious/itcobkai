#!/usr/bin/env python3

from time import time
from keys import KEYS
from utils import CustomError, db, id62, auth
from discord import Discord
from lambdaAPI import LambdaAPI

app = LambdaAPI()
dc = Discord()

def lambda_handler(event, context):
    # return app.debug(event)
    return app.request(event)


@app.api("/init")
def init(post):
    if "_refreshd" in post:
        discord = dc.refresh(post["_refreshd"])
        access_token = discord["_accessd"]
    else:
        discord = None
        access_token = post["_accessd"]
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


@app.api("/users")
def get_user(post):
    if not auth(post["_token"]):
        raise CustomError("無効なトークンです")

    res = db("itcobkai").get_item(Key={"id": post["_id"][0]})
    if "Item" not in res:
        raise CustomError("無効なトークンです")
    else:
        return res["Item"]["profile"]


@app.api("/refresh")
def refresh(post):
    res = db("itcobkai").get_item(Key={"id": post["_id"]})
    if "Item" in res and res["Item"]["secret"]["refresh"] == post["_refresh"]:
        item = res["Item"]
        item["secret"]["access"] = id62()
        item["secret"]["expiration"] = int(time())
        db("itcobkai").put_item(Item=item)
        return item["secret"]["access"]
    else:
        raise CustomError("無効なトークンです")


@app.api("/signup")
def signup(post):
    secret = {
        "access": id62(),
        "refresh": id62(),
        "expiration": int(time()) + 604800
    }
    user = dc.user(post["_accessd"])
    db("itcobkai").put_item( Item={ "id": user["id"], "profile": post["profile"], "secret": secret })
    return {"secret": secret}


@app.api("/code")
def convert_code(post):
    dc = Discord()
    d = dc.get_token(post["code"], post["redirect"])
    return {"discord":d, "user": dc.user(d["access"]), "guild": dc.guild(d["access"])}


@app.api("/test")
def test(post):
    return {"post": post}