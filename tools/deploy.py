#!/usr/bin/env python3

from json import load, dump
from boto3 import resource
from hashlib import md5
from datetime import datetime

now = datetime.now().strftime("%y%m%d_%H%M%S")

bucket = resource('s3').Bucket("itcobkai")
jsonfile = "assets/deploy.json"

ctype = {
    "css": "text/css",
    "html":"text/html",
    "jpg": "image/jpeg",
    "map": "binary/octet-stream",
    "js": "application/javascript",
}

d = load(open(jsonfile))
for key, [date, old_h] in d.items():
    new_h = md5(open(key).read().encode()).hexdigest()
    if old_h != new_h:
        d[key] = [now, new_h]

open("index.html", "wt").write(f"""
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <title>itcobkai</title>
        <link rel="icon" href="assets/favicon.png">
        <script src="build/vendor.js?d={d['build/vendor.js'][0]}"></script>
        <script src="build/main.js?d={d['build/main.js'][0]}"></script>
        <script src="https://unpkg.com/amazon-kinesis-video-streams-webrtc/dist/kvs-webrtc.min.js" async></script>
        <script src="https://sdk.amazonaws.com/js/aws-sdk-2.906.0.min.js" async></script>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
""")

d = load(open(jsonfile))
for key, [date, old_h] in d.items():
    new_h = md5(open(key).read().encode()).hexdigest()
    if old_h != new_h:
        d[key] = [now, new_h]
        bucket.upload_file(key, key, ExtraArgs={"ContentType": ctype[key.split(".")[-1]], 'ACL':'public-read'})
        print(f"upload: {key}")
dump(d, open(jsonfile, "wt"), ensure_ascii=False, indent=2)