#!/usr/bin/env python3

from json import dumps, loads
from boto3 import resource
from base64 import b64decode
from os.path import splitext
from inspect import getmembers, ismethod

class DynamoDB():
    def __init__(self, tablename):
        self.db = resource('dynamodb').Table(tablename)

    def get(self, id):
        res = self.db.get_item(Key={"id": id})
        return res["Item"] if "Item" in res else None

    def put(self, data):
        self.db.put_item(Item=data)

    def scan(self):
        return self.db.scan()["Items"]

    def query():
        pass


class S3():
    def __init__(self):
        self.bucket = resource('s3').Bucket("public.test.s3")
        self.method_str = [x[0] for x in getmembers(self, ismethod)]
    
    def get(self, key):
        ext = splitext(key)[1][1:]
        if "get_" + ext in self.method_str:
            exec(f"self.get_{ext}(key)")

    def put(self, key, obj):
        ext = splitext(key)[1][1:]
        if "get_" + ext in self.method_str:
            exec(f"self.put_{ext}(key, obj)")
    
    def get_json(self, key):
        return loads(self.bucket.get(key)['Body'].read().decode('utf-8'))

    def put_jpg(self, key, obj):
        self.s3.put_object(
            Key=key,
            ACL="public-read",
            Body=b64decode(obj.encode("UTF-8")),
            ContentType='image/jpg',
        )
    
    def put_json(self, key, obj):
        self.bucket.put_object(
            Key=key,
            Body=dumps(obj, indent=2, ensure_ascii=False)
        )
    
    def put_txt(self, key, obj):
        self.bucket.put_object(
            Key=key,
            Body=obj
        )
    
    def put_md(self, key, obj):
        self.put_txt(key, obj)


db = lambda x: DynamoDB(x)
s3 = S3