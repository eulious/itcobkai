#!/usr/bin/env python3

import sys
from time import sleep
from boto3 import resource
from pexpect import spawn
from datetime import datetime
from threading import Thread
from websocket_server import WebsocketServer

browser = None

def new_client(client, server):
    global browser
    browser = client
    print("new client:", client["address"])


def builded():
    now = datetime.now().strftime("%y%m%d_%H%M%S")
    bucket = resource('s3').Bucket("itcobkai")
    bucket.upload_file("build/main.js", "build/main.js", ExtraArgs={"ContentType": "application/javascript", 'ACL':'public-read'})
    print("upload build/main.js")
    bucket.upload_file("build/main.js.map", "build/main.js.map", ExtraArgs={"ContentType": "binary/octet-stream", 'ACL':'public-read'})
    print("upload build/main.js.map")
    bucket.Object("index.html").put(ACL="public-read", ContentType="string", Body=f"""
    <!DOCTYPE html>
    <html lang="ja">
        <head>
            <meta charset="utf-8">
            <title>itcobkai</title>
            <link rel="icon" href="assets/favicon.png">
            <script src="build/vendor.js"></script>
            <script src="build/main.js?d={now}"></script>
            <script src="https://unpkg.com/amazon-kinesis-video-streams-webrtc/dist/kvs-webrtc.min.js" async></script>
            <script src="https://sdk.amazonaws.com/js/aws-sdk-2.906.0.min.js" async></script>
        </head>
        <body>
            <div id="root"></div>
        </body>
    </html>
    """)
    print("upload index.html")

try:
    builded()
    server = WebsocketServer(port=10005, host='0.0.0.0')
    server.set_fn_new_client(new_client)
    th = Thread(target=lambda: server.run_forever())
    th.setDaemon(True)
    th.start()

    p = spawn("npx webpack --mode production --watch", encoding="utf-8")
    p.logfile = sys.stdout
    while True:
        # p.expect("successfully", timeout=None)
        print("wait")
        p.expect("compiled", timeout=None)
        print("reload", end=", ")
        if browser:
            try:
                builded()
                server.send_message(browser, "compiled")
                sleep(10)
            except BrokenPipeError:
                pass
except KeyboardInterrupt:
    print()