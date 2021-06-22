#!/usr/bin/env python3

from os import getenv
from json import loads, dumps
from utils import CustomError
from traceback import format_exc


class LambdaAPI():
    def __init__(self):
        self.funcs = {}


    def get(self, url):
        return self.__api(url, "GET")
    

    def post(self, url):
        return self.__api(url, "POST")


    def __api(self, url, method):
        def _wrapper(func):
            if url not in self.funcs:
                self.funcs[url] = {}
            self.funcs[url][method] = func
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return _wrapper   


    def request(self, event):
        post = self.__parse_params(event)
        try:
            if post["_api"] not in self.funcs \
                or post["_method"] not in self.funcs[post.pop("_api")]:
                raise CustomError(403, "API Not Found")
            body = self.funcs[post.pop("_api")][post.pop("_method")](post)
            status_code = 200
        except CustomError as e:
            body = {"status": "ng", "detail": str(e)}
            status_code = int(e)
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
        if event["body"] and type(event["body"]) == dict:
            post = event["body"]
        elif event["body"] and type(event["body"]) == str:
            post = loads(event["body"])
        return post


    def debug(self, method, api, post={}):
        if not getenv("AWS_LAMBDA_FUNCTION_VERSION"):
            body = self.funcs[api][method](post)
            print(body)
            return body


    def echo(self, event):
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