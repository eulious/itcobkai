#!/usr/bin/env python3

from time import time
from boto3 import resource
from random import randint

db = lambda x: resource('dynamodb').Table(x)
s3 = resource('s3').Bucket("public.test.s3")

class CustomError(Exception):
    def __init__(self, arg=""):
        self.arg = arg
    
    def __str__(self):
        return self.arg


def auth(token, item=None):
    if "-" not in token:
        return False
    id, token = token.split("-")
    if not item:
        res = resource('dynamodb').Table("itcobkai").get_item(Key={"id": id})
        if "Item" not in res:
            return False
        item = res["Item"]
    if item["token"]["expiration"] < int(time()):
        return False
    return item["token"]["access"] == token


def id62(num):
    A = [chr(i) for i in [*range(48, 58), *range(65, 91), *range(97, 123)]]
    uid = ""
    if num:
        while num:
            num, m = divmod(num, 62)
            uid = A[m] + uid
    else:
        for _ in range(12):
            uid += A[randint(0, 61)]
    return uid