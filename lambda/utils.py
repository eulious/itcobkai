#!/usr/bin/env python3

from time import time
from boto3 import resource
from random import randint, seed
from hashlib import blake2b

class DynamoDB():
    def __init__(self, tablename):
        self.db = resource('dynamodb').Table(f"itcobkai_{tablename}")

    def get(self, key, consistency=False):
        res = self.db.get_item(Key=key, ConsistentRead=consistency)
        return res["Item"] if "Item" in res else None

    def put(self, item):
        self.db.put_item(Item=item)

    def puts(self, items):
        with self.db.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)
    
    def delete(self, key):
        self.db.delete_item(Key=key)

    def scan(self):
        return self.db.scan()["Items"]

    def query():
        pass


class CustomError(Exception):
    def __init__(self, code=200, arg=""):
        self.arg = arg
        self.code = code
    
    def __str__(self):
        return str(self.arg)
    
    def __int__(self):
        return self.code if isinstance(self.code, int) else 500


def auth(access, consistency=False):
    res = DynamoDB("tokens").get({"token": access}, consistency)
    if res and "expires_at" in res and res["token"] == access:
        return res["user_id"]
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


def id7(num):
    return id62(int(blake2b(str(num).encode(), digest_size=5).hexdigest(), 16))


def generate_token():
    return {
        "access": id62(),
        "refresh": id62(),
        "expires_at": int(time()) + 60*60
    }


def blake(text):
    return id62(int(blake2b(text.encode(), digest_size=9).hexdigest(), 16))