#!/usr/bin/env python3

import requests
from keys import DISCORD
from json import dumps, loads
from boto3 import client
from traceback import format_exc

def lambda_handler(event, _):
    try:
        if event["body"] and type(event["body"]) == dict:
            post = event["body"]
        elif event["body"] and type(event["body"]) == str:
            post = loads(event["body"])

        data = {
            'client_id': DISCORD["CLIENT_ID"],
            'client_secret': DISCORD["CLIENT_SECRET"],
            'grant_type': 'authorization_code',
            'code': post["code"],
            'redirect_uri': post["redirect"]
        }
        headers = { "Content-Type": "application/x-www-form-urlencoded", }
        url = 'https://discord.com/api/v8/oauth2/token'
        res = requests.post(url, data=data, headers=headers).json()

        headers = { "Authorization": f"Bearer {res['access_token']}" }
        url = "https://discordapp.com/api/users/@me"
        res = requests.get(url, headers=headers).json()

        res = client('lambda').invoke(
            FunctionName='itcobkai',
            InvocationType='RequestResponse',
            Payload=dumps({
                "_api": "/discord",
                "id": res["id"],
                "name": res["username"],
                "thumbnail": f'{res["id"]}/{res["avatar"]}'
            })
        )
        res = loads(res["Payload"].read())
        body = res["body"]
        status_code = res["statusCode"]
    except:
        print(format_exc())
        body = dumps({"status": "ng", "detail": format_exc()}, ensure_ascii=False)
        status_code = 500
    print(body)
    print(status_code)
    return {
        "isBase64Encoded" : False,
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": body
    }