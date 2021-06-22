#!/usr/bin/env python3

from aws import db
from time import time
from random import randint, seed

class CustomError(Exception):
    def __init__(self, code=200, arg=""):
        self.arg = arg
        self.code = code
    
    def __str__(self):
        return self.arg
    
    def __int__(self):
        return self.code


def try_get_me(post):
    res = db("itcobkai").get(post["_id"])
    if res and res["secret"]["access"] == post["_access"]:
        return res["profile"]
    else:
        raise CustomError(401, "無効なトークンです")


def id62(num = 0):
    DIGITS = 12
    uid = ""
    seed()
    A = [chr(i) for i in [*range(48, 58), *range(65, 91), *range(97, 123)]]
    num = num if num else randint(62**(DIGITS-1), 62**DIGITS-1)
    while num:
        num, m = divmod(num, 62)
        uid = A[m] + uid
    return uid


def generate_token():
    return {
        "access": id62(),
        "refresh": id62(),
        "expires_at": int(time()) + 604800
    }