#!/usr/bin/env python3

from boto3 import resource
from aws import Cursor
from keys import KEYS, S3_INTERNAL, S3_PUBLIC
from time import time
from utils import CustomError, auth, generate_token, id62, blake
from base64 import b64decode
from lambdaAPI import LambdaAPI

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
    return { "profiles": profiles, "keys": KEYS }


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

    res = cur.execute("SELECT * FROM roles WHERE role=? AND attribute='個人'", (post["name"],))
    if res == []:
        [(max_role_id,)] = cur.execute("SELECT max(id) FROM roles")
        cur.execute("INSERT INTO roles VALUES (?, ?, ?, ?)",
            (max_role_id+1, post["name"], "個人", 0))
        cur.execute("INSERT INTO profiles VALUES (?, ?)",
            (id, max_role_id+1))
    cur.save()
    return { "id": id, "secret": secret }


@app.get("/login/master")
def login_master(post):
    master = [
        "ym4F1XcR8k", # kyoichi
        "R34Xzb2gd9", # 笠井
        "WOzosMqMAy"  # うり
    ]
    return {"keys": KEYS if post["_id"] in master else None }


@app.get("/notes/init")
def get_notes(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    res = cur.execute("SELECT role, attribute FROM roles")
    res = cur.execute("SELECT role, attribute FROM roles")
    cur.delete()
    roles = {}
    for role, attr in res:
        if attr not in roles:
            roles[attr] = []
        roles[attr].append(role)
    return {"roles": roles}


@app.get("/notes")
def get_notes(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])

    res = cur.execute("""
        SELECT notes.id, users.name, notes.title
        FROM notes
        INNER JOIN users ON users.id = notes.user_id
        ORDER BY updated_at DESC
        """)
    cur.delete()
    d = {}
    users = []
    for id, user, title, updated_at in res:
        if user not in d:
            d[user] = []
            users.append(user)
        d[user].append({
            "id": id,
            "title": title,
            "isUpdated": False
        })
    out = []
    for user in users:
        out.append({
            "name": user,
            "notes": d[user]
        })
    return d


@app.get("/notes/contents")
def get_note(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    roles = set()
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
    cur.delete()
    if or_flag:
        raise CustomError(500, "アクセス権限がありません")

    s3 = resource('s3').Bucket(S3_INTERNAL)
    value = s3.Object(f'note/{post["note"]}.md').get()['Body'].read()


@app.post("/notes/contents")
def post_note(post):
    cur = Cursor()
    note_id = post["note_id"] if "note_id" in post else id62()
    auth(cur, post["_id"], post["_access"])
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
    cur.save()

    resource('s3').Bucket(S3_INTERNAL).put_object(
        Key=f'md/{post["id"]}.md',
        Body=b64decode(post["base64"].encode("UTF-8")),
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