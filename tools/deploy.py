#!/usr/bin/env python3

from json import load, dump
from boto3 import resource
from hashlib import md5

bucket = resource('s3').Bucket("public.test.s3")
jsonfile = "./assets/deploy.json"

ctype = {
    "css": "text/css",
    "html":"text/html",
    "jpg": "image/jpeg",
    "map": "binary/octet-stream",
    "js": "application/javascript",
}

d = load(open(jsonfile))
for key, old_h in d.items():
    new_h = md5(open(key).read().encode()).hexdigest()
    if old_h != new_h:
        d[key] = new_h
        bucket.upload_file(key, key, ExtraArgs={"ContentType": ctype[key.split(".")[-1]], 'ACL':'public-read'})
        print(f"upload: {key}")
dump(d, open(jsonfile, "wt"), ensure_ascii=False, indent=2)
