#!/usr/bin/env python3

from utils import CustomError, id62
from time import time
from keys import DISCORD
import requests

class Discord():
    # FetchAPIやurllib.requestで何故かpostできない
    def __init__(self):
        self.oauth_url = 'https://discord.com/api/v8/oauth2/token'
        self.url = "https://discordapp.com/api/users/@me"
        self.itc = "377392053182660609"
        self.itc_ob = "840824837211815946"


    def get_token(self, code, redirect):
        data = {
            'client_id': DISCORD["CLIENT_ID"],
            'client_secret': DISCORD["CLIENT_SECRET"],
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect
        }
        headers = { "Content-Type": "application/x-www-form-urlencoded", }
        res = requests.post(self.oauth_url, data=data, headers=headers)
        return self.__extract_token(res.json())


    def refresh(self, refresh_token):
        data = {
            'client_id': DISCORD["CLIENT_ID"],
            'client_secret': DISCORD["CLIENT_SECRET"],
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }
        headers = { "Content-Type": "application/x-www-form-urlencoded", }
        res = requests.post(self.oauth_url, data=data, headers=headers)
        return self.__extract_token(res.json())
    

    def __extract_token(self, res):
        try:
            return {
                "access": res["access_token"],
                "refresh": res["refresh_token"],
                "expires_at": res["expires_in"] + int(time())
            }
        except:
            raise CustomError(f"Discordの認証が失敗しました: {res}")


    def guild(self, token):
        headers = { "Authorization": f"Bearer {token}" }
        url = "https://discordapp.com/api/users/@me/guilds"
        res = requests.get(url, headers=headers)
        group = []
        for obj in res.json():
            if obj["id"] == self.itc:
                group.append("itc")
            if obj["id"] == self.itc_ob:
                group.append("itc_ob")
        if group == []:
            CustomError(f"サーバに参加する資格がありません")
        return group


    def user(self, token):
        headers = { "Authorization": f"Bearer {token}" }
        url = "https://discordapp.com/api/users/@me"
        res = requests.get(url, headers=headers).json()
        try:
            return {
                "id": id62(int(res["id"])),
                "name": res["username"],
                "thumbnail": res["avatar"]
            }
        except:
            raise CustomError(f"Discordの認証が失敗しました: {res}")