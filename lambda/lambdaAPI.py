#!/usr/bin/env python3

from re import search
from os import getenv
from json import loads, dumps
from time import time
from keys import SESSION_PASSWORD, TOKEN_PASSWORD
from utils import CustomError
from base64 import b64decode, b64encode
from decimal import Decimal
from hashlib import blake2b
from traceback import format_exc

class LambdaAPI():
    def __init__(self):
        self.funcs = {}
        self.id = ""
        self.__incoming_cookie = ""
        self.__sent_cookie = "sessionId=dummy"
        self.__origin = "*"


    def get(self, url, token=True, session=True):
        return self.__api(url, "GET", token, session)
    

    def post(self, url, token=True, session=True):
        return self.__api(url, "POST", token, session)
    

    def put(self, url, token=True, session=True):
        return self.__api(url, "PUT", token, session)


    def delete(self, url, token=True, session=True):
        return self.__api(url, "DELETE", token, session)


    def __api(self, url, method, token, session):
        def _wrapper(func):
            if url not in self.funcs:
                self.funcs[url] = {}
            self.funcs[url][method] = {
                "func": func,
                "token": token,
                "session": session
            }
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return _wrapper   


    def request(self, event):
        try:
            post = self.__parse_params(event)
            if post["_api"] not in self.funcs \
                or post["_method"] not in self.funcs[post["_api"]]:
                raise CustomError(403, f"API Not Found, {post}")
            props = self.funcs[post.pop("_api")][post.pop("_method")]
            if props["session"]:
                self.id = self.__auth_session()
            if props["token"]:
                self.id = self.__auth_token(post.pop("_token"))
            body = props["func"](post)
            return self.__response(200, body if body else {})
        except CustomError as e:
            return self.__response(int(e), {"status": "ng", "detail": str(e)})
        except:
            print(format_exc())
            return self.__response(500, {"status": "ng", "detail": format_exc()})
            return self.__response(500, {"status": "ng", "detail": "例外"})


    def __blake(self, text):
        digest = blake2b(text.encode(), digest_size=9).digest()
        return b64encode(digest).decode()


    def __encode(self, d, passwd):
        b64 = b64encode(dumps(d).encode()).decode()
        return b64 + "." + self.__blake(b64 + passwd)


    def __decode(self, token, passwd):
        [b64, hash] = token.split(".")
        assert hash == self.__blake(b64 + passwd)
        return loads(b64decode(b64).decode())


    def issue_session(self, id):
        token = self.__encode({"id": id}, SESSION_PASSWORD)
        self.__sent_cookie = f"token={token}; max-age=315360000; SameSite=None; Secure; HttpOnly"


    def __auth_session(self):
        try:
            token = search("(?<=token\=)[^;]+(?=(;|$))", self.__incoming_cookie).group()
            payload = self.__decode(token, SESSION_PASSWORD)
            assert "id" in payload
        except Exception as e:
            raise CustomError(401, f"無効なセッションです: {format_exc()}")
        return payload["id"]


    def issue_token(self):
        payload = { "id": self.id, "iat": int(time()) }
        return self.__encode(payload, TOKEN_PASSWORD)


    def __auth_token(self, token):
        try:
            payload = self.__decode(token, TOKEN_PASSWORD)
            assert "id" in payload
            assert time() < payload["iat"] + 30*60
        except Exception as e:
            raise CustomError(401, f"無効なトークンです: {format_exc()}")
        return payload["id"]


    def __response(self, status_code, body):
        return {
            "isBase64Encoded" : False,
            "statusCode": status_code,
            "headers": {
                "Content-Type": "application/json",
                "Set-Cookie": self.__sent_cookie,
                "Access-Control-Allow-Credentials": True,
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": self.__origin,
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": dumps(body, ensure_ascii=False, separators=(",", ":"), default=self.__default_dumps)
        }


    def __parse_params(self, event):
        if "body" not in event:
            post = {"_method": "LAMBDA", **event}
        elif event["body"] and type(event["body"]) == dict:
            post = event["body"]
        elif event["body"] and type(event["body"]) == str:
            post = loads(event["body"])
        elif event["body"] == None:
            raise CustomError(500, "bodyがありません")
        if post["_method"] == "LAMBDA" and "body" in event:
            raise CustomError(403, "許可されていないメソッドです")
        if "headers" in event and event["headers"]:
            headers = event["headers"]
            self.__incoming_cookie = headers["cookie"] if "cookie" in headers else ""
            self.__origin = headers["origin"] if "origin" in headers else "*"
        return post


    def __default_dumps(self, obj):
        if isinstance(obj, Decimal):
            return int(obj)
        raise TypeError(f"Object is not JSON serializable: {obj}")
    

    def debug(self, method, api, post={}):
        if not getenv("AWS_LAMBDA_FUNCTION_VERSION"):
            body = self.funcs[api][method]["func"](post)
            print(body)
            return body


    def echo(self, event):
        return self.__response(200, event)