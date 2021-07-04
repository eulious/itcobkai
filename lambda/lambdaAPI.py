#!/usr/bin/env python3

from os import getenv
from json import loads, dumps
from utils import CustomError
from decimal import Decimal
from traceback import format_exc


class LambdaAPI():
    def __init__(self):
        self.funcs = {}


    def get(self, url):
        return self.__api(url, "GET")
    

    def post(self, url):
        return self.__api(url, "POST")
    

    def lambda(self, uri):
        return self.__api(uri, "LAMBDA")


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
        try:
            post = self.__parse_params(event)
            if post["_api"] not in self.funcs \
                or post["_method"] not in self.funcs[post["_api"]]:
                raise CustomError(403, "API Not Found")
            body = self.funcs[post.pop("_api")][post.pop("_method")](post)
            return self.__response(200, body if body else {})
        except CustomError as e:
            return self.__response(int(e), {"status": "ng", "detail": str(e)})
        except:
            print(format_exc())
            return self.__response(500, {"status": "ng", "detail": format_exc()})
            return self.__response(500, {"status": "ng", "detail": "例外"})
    

    def add(self, app):
        pass


    def __response(self, status_code, body):
        return {
            "isBase64Encoded" : False,
            "statusCode": status_code,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": dumps(body, ensure_ascii=False, default=self.__default_dumps)
        }


    def __parse_params(self, event):
        if "body" not in event:
            post = {"_method": "LAMBDA", **event}
        elif event["body"] and type(event["body"]) == dict:
            post = event["body"]
        elif event["body"] and type(event["body"]) == str:
            post = loads(event["body"])

        if post["_method"] == "LAMBDA" and "body" in event:
            raise CustomError(403, "許可されていないメソッドです")
        return post


    def __default_dumps(self, obj):
        if isinstance(obj, Decimal):
            return int(obj)
        raise TypeError(f"Object is not JSON serializable: {obj}")
    

    def debug(self, method, api, post={}):
        if not getenv("AWS_LAMBDA_FUNCTION_VERSION"):
            body = self.funcs[api][method](post)
            print(body)
            return body


    def echo(self, event):
        self.__response(200, event)