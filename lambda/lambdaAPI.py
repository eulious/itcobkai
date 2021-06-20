#!/usr/bin/env python3

from utils import CustomError
from re import sub
from json import loads, dumps
from traceback import format_exc


class LambdaAPI():
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