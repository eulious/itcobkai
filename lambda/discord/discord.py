#!/usr/bin/env python3

from keys import DISCORD
from json import dumps, loads
from boto3 import client
import requests

def lambda_handler(event, context):
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
    res = requests.post(url, data=data, headers=headers)

    headers = { "Authorization": f"Bearer {res['access_token']}" }
    url = "https://discordapp.com/api/users/@me"
    res = requests.get(url, headers=headers).json()

    res = client('lambda').invoke(
        FunctionName='itcobkai',
        InvocationType='RequestResponse',
        Payload=dumps({
            "id": res["id"],
            "name": res["username"],
            "thumbnail": f'{res["id"]}/{res["avatar"]}'
        })
    )

    body = loads(res["Payload"].read()) 
    return {
        "isBase64Encoded" : False,
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": dumps(body, ensure_ascii=False)
    }