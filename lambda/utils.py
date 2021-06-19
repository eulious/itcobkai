#!/usr/bin/env python3

from re import sub
from time import time
from json import loads, dumps
from boto3 import resource
from random import randint
from traceback import format_exc

db = lambda x: resource('dynamodb').Table(x)
s3 = resource('s3').Bucket("public.test.s3")

class CustomError(Exception):
    def __init__(self, arg=""):
        self.arg = arg
    
    def __str__(self):
        return self.arg


class API():
    def __init__(self):
        self.funcs = {}


    def get(self, url):
        def _wrapper(func):
            if not url in self.funcs:
                self.funcs[url] = {}
            self.funcs[url]["GET"] = func
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return _wrapper


    def post(self, url):
        def _wrapper(func):
            if not self.funcs[url]:
                self.funcs[url] = {}
            self.funcs[url]["POST"] = func
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return _wrapper   


    def request(self, event):
        params = self.__parse_params(event)
        try:
            body = self.funcs[params["api"]][params["method"]](params)
            status_code = 200
        except CustomError as e:
            body = {"status": "ng", "detail": str(e)}
        except:
            body = {"status": "ng", "detail": format_exc()}
            status_code = 500
            print(format_exc())
            #body = {"status": "ng", "detail": "例外"}
        return {
            "isBase64Encoded" : False,
            "statusCode": status_code,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": dumps(body, ensure_ascii=False)
        }


    def __parse_params(self, event):
        params = {}
        params["get"] = event["queryStringParameters"]
        params["api"] = params["get"]["api"]
        params["method"] = event["httpMethod"]
        headers = event["headers"]
        if headers and "Authorization" in headers:
            params["token"] = sub(".*Bearer\ ", "", headers["Authorization"])
        if event["body"] and type(event["body"]) == dict:
            params["post"] = event["body"]
        elif event["body"] and type(event["body"]) == str:
            params["post"] = loads(event["body"])
        return params
    

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