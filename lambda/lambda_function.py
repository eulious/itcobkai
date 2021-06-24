#!/usr/bin/env python3

from os import getenv
from aws import db
from keys import KEYS
from utils import CustomError, generate_token, try_get_me
from discord import Discord
from lambdaAPI import LambdaAPI

app = LambdaAPI()


def lambda_handler(event, context):
    return app.request(event)


@app.get("/init")
def init(post):
    dc = Discord()
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
    try_get_me(post["_id"], post["_access"])
    res = db("itcobkai").get(post["id"])
    if res:
        return res["profile"]
    else:
        raise CustomError(500, "ユーザが存在しません")


@app.get("/users/me")
def get_user_me(post):
    return try_get_me(post["_id"], post["_access"])["profile"]


@app.post("/users/me")
def post_user_me(post):
    me = try_get_me(post["_id"], post["_access"])
    me["profile"] = { **me["profile"], **post["profile"] }
    db("itcobkai").put(me)
    return {}


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
    dc = Discord()
    return dc.refresh(post["_refresh"])


@app.post("/signup")
def convert_code(post):
    dc = Discord()
    discord = dc.get_token(post["code"], post["redirect"])
    user = dc.user(discord["access"])
    guild = dc.guild(discord["access"])
    secret = generate_token()
    profile = {
        "name": user["name"],
        "year": 0,
        "detail": "",
        "faculty": "",
        "thumbnail": user["thumbnail"],
        "member": {
            "dtm": False,
            "cg": False,
            "prog": False,
            "mv": False
        },
        "guild": guild
    }
    db("itcobkai").put({"id": user["id"], "profile": profile, "secret": secret})
    return { "id": user["id"], "discord": discord, "profile": profile, "secret": secret }