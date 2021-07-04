#!/usr/bin/env python3

from os import getenv
from aws import Cursor
from keys import KEYS
from time import time
from utils import CustomError, auth, generate_token, id62
from lambdaAPI import LambdaAPI

app = LambdaAPI()


def lambda_handler(event, context):
    return app.request(event)


@app.get("/init")
def init(post):
    conn = Cursor()
    auth(conn, post["_id"], post["_access"])
    with conn() as cur:
        profiles = {}
        for id, name, thumbnail in cur.execute("SELECT * FROM users"):
            profiles[id] = {"name": name, "thumbnail": thumbnail}
    conn.close()
    return { "profiles": profiles, "keys": KEYS }


@app.get("/users")
def get_user(post):
    conn = Cursor()
    auth(conn, post["_id"], post["_access"])
    res = conn().execute("SELECT * FROM users WHERE id=?", (post["id"],))
    conn.close()
    if res:
        [(_, name, thumbnail)] = res
        profile = {"name": name, "thumbnail": thumbnail}
        return profile
    else:
        raise CustomError(500, "ユーザが存在しません")


@app.post("/refresh")
def refresh(post):
    secret = generate_token()
    conn = Cursor()
    with conn() as cur:
        res = cur.execute("""
            SELECT id FROM users WHERE id62=? AND token=? AND expires_at IS NULL
            """, (post["_id"], post["_refresh"]))
        if res == []:
            raise CustomError(401, "無効なトークンです")
        cur.execute("""
            UPDATE users SET refresh=? WHERE token=?
            """, (secret["refresh"], post["_refresh"]))
    conn.save()
    return secret


@app.lambda("/discord")
def discord(post):
    secret = generate_token()
    conn = Cursor()
    id = id62(post["id"])
    with conn() as cur:
        cur.execute("INSERT INTO users(?, ?, ?)",
            (id, post["name"], post["thumbnail"]))
        cur.execute("INSERT INTO tokens(?, ?, ?, ?)",
            (id, secret["access"], secret["expires_at"]))
        cur.execute("INSERT INTO tokens(?, ?, ?, ?)",
            (id, secret["refresh"], None))
    conn.save()
    return { "id": id, "secret": secret }


@app.get("/login/master")
def login_master(post):
    master = [
        "ym4F1XcR8k", # kyoichi
        "R34Xzb2gd9", # 笠井
        "WOzosMqMAy"  # うり
    ]
    return {"keys": KEYS if post["_id"] in master else None }


@app.get("/notes/")
def get_notes(post):
    conn = Cursor()
    auth(conn, post["_id"], post["_access"])
    res = conn().execute("""
        SELECT notes.id, users.name, notes.title, notes.updated_at FROM notes
        INNER JOIN users ON users.id = notes.id
        WHERE id IN (
            SELECT DISTINCT note_id
            FROM permission
            WHERE role_id IN (
                SELECT role_id
                FROM profiles
                WHERE user_id=?
            )
        )
        """, (post["_id"],))
    d = {}
    for id, user, title, updated_at in res:
        if user not in d:
            d[user] = []
        d[user].append({
            "id": id,
            "title": title,
            "isUpdated": updated_at
        })
    conn.close()
    return d


@app.get("/notes/contents")
def get_note(post):
    conn = Cursor()
    auth(conn, post["_id"], post["_access"])
    roles = set()
    with conn() as cur:
        res = cur.execute("SELECT role_id FROM profiles WHERE user_id=?", (post["_id"],))
        for role_id in res:
            roles.add(role_id)
        res = cur.execute("SELECT role_id, operation FROM permission WHERE note_id=?", (post["note"],))

    or_flag = True
    for role_id, oper in res:
        if oper == "or" and role_id not in roles:
            or_flag = False
        elif oper == "and" and role_id not in roles:
            raise CustomError(500, "アクセス権限がありません")
    conn.close()
    if or_flag:
        raise CustomError(500, "アクセス権限がありません")
    # S3から取得


@app.post("/notes/contents")
def post_note(post):
    conn = Cursor()
    note_id = post["note_id"] if "note_id" in post else id62()
    auth(conn, post["_id"], post["_access"])
    with conn() as cur:
        cur.execute("DELETE FROM notes WHERE id=?", (post["note_id"],))
        cur.execute("INSERT INTO notes VALUES (?, ?, ?, ?)",
            (note_id, post["_id"], post["title"], int(time())))

        if "images" in post and post["images"]:
            images_query = []
            for image_id in post["images"]:
                images_query.append((note_id, image_id))
            cur.execute("DELETE FROM images WHERE note_id=?", (post["note_id"],))
            cur.executemany("INSERT INTO permission VALUES (?, ?)", images_query)

        permission_query = []
        res = cur.executein("SELECT role_id FROM roles WHERE name=(%s)", post["permission"])
        for role_id in res:
            permission_query.append((post["note_id"], role_id, "or"))
        cur.execute("DELETE FROM permission WHERE note_id=?", (post["note_id"],))
        cur.executemany("INSERT INTO permission VALUES (?, ?, ?)", permission_query)
    conn.save()
    # S3にnote追加


@app.post("/notes/img")
def upload_img(post):
    conn = Cursor()
    auth(conn, post["_id"], post["_access"])
    img_id = id62()
    conn().execute("INSERT INTO images (?, ?, ?)", (img_id, post["note_id"]))
    conn.save()
    # S3にimg追加
    return {"img_id": img_id}