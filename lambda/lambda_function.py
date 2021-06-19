#!/usr/bin/env python3

from time import time
from base64 import b64decode
from .keys import KEYS
from .utils import API, CustomError, db, id62, s3, auth

app = API()

def lambda_handler(event, context):
    return app.request(event)


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
def refresh(param):
    id, token = param["token"].split("-")
    res = db("itcobkai").get_item(Key={"id": id})
    if "Item" in res and res["Item"]["secret"]["refresh"] == token:
        res["secret"]["access"] = id62()
        res["secret"]["expiration"] = int(time())
        db("itcobkai").put_item( Item=res)
        return res["token"]["access"] == token
    else:
        raise CustomError("無効なトークンです")


@app.get("signup")
def signup(param):
    post = param["post"]

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
    
    db("itcobkai").put_item( Item={ "id": id, "profile": post ,"secret": secret })
    return {"secret": secret}