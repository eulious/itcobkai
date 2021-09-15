#!/usr/bin/env python3

from aws import Cursor
from keys import KEYS, S3_INTERNAL, S3_PUBLIC
from time import time
from boto3 import resource
from utils import CustomError, auth, generate_token, id62, blake
from base64 import b64decode
from lambdaAPI import LambdaAPI
from get_notes import get_notes

app = LambdaAPI()

def lambda_handler(event, _):
    return app.request(event)


@app.get("/rtc/init")
def init(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    profiles = {}
    res = cur.execute("SELECT * FROM users WHERE name IS NOT NULL")
    for id, name, thumbnail in res:
        profiles[id] = {
            "name": name,
            "thumbnail": thumbnail,
            "year": None,
            "faculty": None,
            "member": {"dtm": False, "cg": False, "prog": False, "mv": False}
        }
    res = cur.execute("""
        SELECT user_id, role, attribute
        FROM profiles
        INNER JOIN roles ON roles.id = profiles.role_id
        """)
    for id, role, attr in res:
        if id not in profiles:
            continue
        if "年度" in attr:
            profiles[id]["year"] = role
        elif "学科" in attr:
            profiles[id]["faculty"] = role
        elif "DTM" in role:
            profiles[id]["member"]["dtm"] = True
        elif "PROG" in role:
            profiles[id]["member"]["prog"] = True
        elif "CG" in role:
            profiles[id]["member"]["cg"] = True
        elif "MV" in role:
            profiles[id]["member"]["mv"] = True
    cur.delete()

    master = post["_id"] in [
        "ym4F1XcR8k", # kyoichi
        "R34Xzb2gd9", # 笠井
        "WOzosMqMAy"  # うり
    ]
    return { "profiles": profiles, "keys": KEYS, "master": master }


@app.get("/user")
def get_user(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    res = cur.execute("SELECT * FROM users WHERE id=?", (post["id"],))
    cur.delete()
    if res and res[0][1]:
        [(_, name, thumbnail)] = res
        profile = {"name": name, "thumbnail": thumbnail}
        return profile
    else:
        raise CustomError(500, "ユーザが存在しません")


@app.post("/refresh")
def refresh(post):
    secret = generate_token()
    cur = Cursor()
    res = cur.execute("""
        SELECT id FROM users WHERE id62=? AND token=? AND expires_at IS NULL
        """, (post["_id"], post["_refresh"]))
    if res == []:
        raise CustomError(401, "無効なトークンです")
    cur.execute("""
        UPDATE users SET refresh=? WHERE token=?
        """, (secret["refresh"], post["_refresh"]))
    cur.save()
    return secret


@app.invoked("/discord")
def discord(post):
    secret = generate_token()
    id = id62(int(post["id"]))
    cur = Cursor()
    res = cur.execute("SELECT * FROM users WHERE id=?", (id,))
    if res == []:
        raise CustomError(401, "無効なユーザーです")
    cur.execute("UPDATE users SET name=?, thumbnail=? WHERE id=?",
        (post["name"], post["thumbnail"], id))
    cur.execute("INSERT INTO tokens VALUES (?, ?, ?)",
        (id, secret["access"], secret["expires_at"]))
    cur.execute("INSERT INTO tokens VALUES (?, ?, ?)",
        (id, secret["refresh"], None))
    
    # res = cur.execute("SELECT * FROM roles WHERE role=? AND attribute='個人'", (post["name"],))
    # if res == []:
    #     [(max_role_id,)] = cur.execute("SELECT max(id) FROM roles")
    #     cur.execute("INSERT INTO roles VALUES (?, ?, ?, ?)",
    #         (max_role_id+1, post["name"], "個人", 0))
    #     cur.execute("INSERT INTO profiles VALUES (?, ?)",
    #         (id, max_role_id+1))
    cur.save()
    return { "id": id, "secret": secret }


@app.get("/notes/init")
def get_roles(post):
    return get_notes(post)


@app.get("/notes/contents")
def get_note(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    cur.execute("DELETE FROM unreads WHERE note_id=? AND user_id=?",
        (post["note_id"], post["_id"],))
    [(id, user_id, title, updated_at)] = cur.execute("""
        SELECT id, user_id, title, updated_at FROM notes WHERE id=?
        """, (post["note_id"],))
    cur.save()
    s3 = resource('s3').Bucket(S3_INTERNAL)
    obj = s3.Object(f'md/{post["note_id"]}.md')
    content = obj.get()['Body'].read().decode('utf-8')
    return {
        "permission": [],
        "content": content,
        "info": {
            "id": id,
            "updated_at": updated_at,
            "title": title,
            "unread": False,
            "editable": user_id == post["_id"],
        }
    }


@app.post("/notes/contents")
def post_note(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    info = post["info"]
    cur.execute("""
        UPDATE notes
        SET title=?, updated_at=?
        WHERE id=?
        """, (info["title"], int(time()), info["id"]))

    # permission_query = []
    # res = cur.executein("SELECT role_id FROM roles WHERE name=(%s)", post["permission"])
    # for role_id in res:
    #     permission_query.append((post["note_id"], role_id, "or"))
    # cur.execute("DELETE FROM permission WHERE note_id=?", (post["note_id"],))
    # cur.executemany("INSERT INTO permission VALUES (?, ?, ?)", permission_query)
    cur.save()

    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f'md/{info["id"]}.md',
        Body=post["content"],
        ContentType='text/plain',
    )


@app.post("/notes/assets")
def upload_img(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    cur.delete()
    asset_id = blake(post["base64"])

    s3 = resource('s3').Bucket(S3_PUBLIC)
    if post["type"] == "jpg":
        s3.put_object(
            Key=f'note/jpg/{asset_id}.jpg',
            ACL="public-read",
            Body=b64decode(post["base64"].encode("UTF-8")),
            ContentType='image/jpg',
        )
    elif post["type"] == "mp3":
        s3.put_object(
            Key=f'note/mp3/{asset_id}.mp3',
            ACL="public-read",
            Body=b64decode(post["base64"].encode("UTF-8")),
            ContentType='audio/mp3',
        )
    return {"asset_id": asset_id}


@app.get("/notes/add")
def add_note(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    note_id = id62()
    cur.execute("INSERT INTO notes VALUES (?, ?, ?, ?)",
        (note_id, post["_id"], "名称未設定", int(time())))

    res = cur.execute("SELECT id FROM users WHERE name IS NOT NULL")
    unread_query = []
    for user_id in res:
        if user_id == post["_id"]:
            unread_query.append((user_id, note_id))
    if len(unread_query):
        cur.executemany("INSERT INTO unreads VALUES (?, ?)", unread_query)
    cur.save()

    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f'md/{note_id}.md',
        Body="",
        ContentType='text/plain',
    )
    return {"note_id": note_id}


@app.get("/notes/remove")
def remove_note(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    cur.execute("DELETE FROM notes WHERE id=?", (post["note_id"],))
    cur.execute("DELETE FROM unreads WHERE note_id=?", (post["note_id"],))
    cur.save()
    resource("s3").Object(S3_INTERNAL, f"md/{post['note_id']}.md").delete()