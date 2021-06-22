#!/usr/bin/env python3

from aws import db
from keys import KEYS
from utils import CustomError, generate_token, try_get_me
from discord import Discord
from lambdaAPI import LambdaAPI

app = LambdaAPI()
dc = Discord()

def lambda_handler(event, context):
    return app.request(event)


@app.get("/init")
def init(post):
    user = dc.user(post["_access"])
    items = db("itcobkai").scan()
    profiles = {}
    for item in items:
        profile = item["profile"]
        profiles[item["id"]] = profile
        if user["id"] == item["id"] and (user["name"] != profile["name"] or user["thumbnail"] != profile["thumbnail"]):
            profile["name"] = user["name"]
            profile["thumbnail"] = user["thumbnail"]
            db("itcobkai").put({**item, **profile})
    return { "profiles": profiles, "keys": KEYS }


@app.get("/users")
def get_user(post):
    try_get_me(post)
    res = db("itcobkai").get(post["id"])
    return res["profile"] if res else CustomError(500, "ユーザが存在しません")


@app.get("/users/me")
def get_user_me(post):
    return try_get_me(post)


@app.post("/refresh/db")
def refresh(post):
    res = db("itcobkai").get(post["_id"])
    if res and res["secret"]["refresh"] == post["_refresh"]:
        res["secret"] = generate_token()
        db("itcobkai").put(res)
        return res["secret"]
    else:
        raise CustomError(401, "無効なトークンです")


@app.post("/refresh/discord")
def refresh(post):
    return dc.refresh(post["_refresh"])


@app.post("/signup")
def signup(post):
    secret = generate_token()
    user = dc.user(post["_accessd"])
    db("itcobkai").put({"id": user["id"], "profile": post["profile"], "secret": secret})
    return {"secret": secret}


@app.post("/code")
def convert_code(post):
    dc = Discord()
    d = dc.get_token(post["code"], post["redirect"])
    return {"discord":d, "user": dc.user(d["access"]), "guild": dc.guild(d["access"])}