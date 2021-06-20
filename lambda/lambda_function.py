#!/usr/bin/env python3

from time import time
from keys import KEYS
from utils import CustomError, db, id62, try_get_me
from discord import Discord
from lambdaAPI import LambdaAPI

app = LambdaAPI()
dc = Discord()

def lambda_handler(event, context):
    # return app.debug(event)
    return app.request(event)


@app.api("/init")
def init(post):
    user = dc.user(post["_access"])
    
    items = db("itcobkai").scan()["Items"]
    profiles = {}
    for item in items:
        profile = item["profile"]
        profiles[item["id"]] = profile
        if user["id"] == item["id"] and (user["name"] != profile["name"] or user["thumbnail"] != profile["thumbnail"]):
            profile["name"] = user["name"]
            profile["thumbnail"] = user["thumbnail"]
            db("itcobkai").put_item( Item={ "id": item["id"], "profile": profile,"secret": item["secret"] })
    return { "profiles": profiles, "keys": KEYS }


@app.api("/users")
def get_user(post):
    try_get_me(post)
    res = db("itcobkai").get_item(Key={"id": post["id"][0]})
    if "Item" in res:
        return res["Item"]["profile"]
    else:
        raise CustomError("ユーザが存在しません")


@app.api("/users/me")
def get_user_me(post):
    return try_get_me(post)


@app.api("/refresh/db")
def refresh(post):
    res = db("itcobkai").get_item(Key={"id": post["_id"]})
    if "Item" in res and res["Item"]["secret"]["refresh"] == post["_refresh"]:
        res["Item"]["secret"] = {
            "access": id62(),
            "refresh": id62(),
            "expires_at": int(time()) + 604800
        }
        db("itcobkai").put_item(Item=res["Item"])
        return res["Item"]["secret"]
    else:
        raise CustomError("無効なトークンです")


@app.api("/refresh/discord")
def refresh(post):
    return dc.refresh(post["_refresh"])


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