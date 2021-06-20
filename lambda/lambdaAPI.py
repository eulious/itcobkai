#!/usr/bin/env python3

from json import loads, dumps
from utils import CustomError
from traceback import format_exc


class LambdaAPI():
    def __init__(self):
        self.funcs = {}


    def api(self, url):
        def _wrapper(func):
            self.funcs[url] = func
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return _wrapper   


    def request(self, event):
        post = self.__parse_params(event)
        try:
            body = self.funcs[post["_api"]](post)
            status_code = 200
        except CustomError as e:
            body = {"status": "ng", "detail": str(e)}
            status_code = 200
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


    def debug(self, event):
        return {
            "isBase64Encoded" : False,
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": dumps(event, ensure_ascii=False)
        }


    def __parse_params(self, event):
        if event["body"] and type(event["body"]) == dict:
            post = event["body"]
        elif event["body"] and type(event["body"]) == str:
            post = loads(event["body"])
        return post