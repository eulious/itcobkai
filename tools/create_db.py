#!/usr/bin/env python3

"""
DBを作成する
"""

from os import remove
from json import load
from sqlite3 import connect
from os.path import exists

JSON_PATH = "./210918_105233.json"
DB_PATH = "itcobkai.db"

def id62(num):
    uid = ""
    A = [chr(i) for i in [*range(48, 58), *range(65, 91), *range(97, 123)]]
    while num:
        num, m = divmod(num, 62)
        uid = A[m] + uid
    return uid

d = load(open(JSON_PATH))
if exists(DB_PATH):
    remove(DB_PATH)

def annotate(role):
    if "卒業" in role or "旧" in role:
        return "OB"
    elif "期生" in role:
        return "年度"
    elif "長" in role or "係" in role:
        return "役職"
    elif "DTM" in role or "PROG" in role or "CG" in role or "MV" in role:
        return "部門"
    elif "科" in role:
        return "学科"
    elif "マテリアル創成" in role:
        return "学科"
    elif "電子システム" in role:
        return "学科"
    elif "生命システム" in role:
        return "学科"
    elif "代表" in role:
        return "役職"
    else:
        return "その他"

def proofread(role):
    if "マテリアル創成" in role:
        return "AM科"
    elif "電子システム" in role:
        return "AE科"
    elif "生命システム" in role:
        return "AB科"
    else:
        return role


roles = {}
users_query = []
roles_query = []
profiles_query = []

for role in d["roles"]:
    role_id = id62(role["id"])
    name = proofread(role["name"])
    roles[role_id] = name
    roles_query.append((role_id, name, annotate(name)))

for member in d["members"]:
    user_id = id62(member["id"])
    img = member["img"].split("avatars/")[1].split("?")[0]
    name = member["nickname"] if member["nickname"] else member["name"]
    users_query.append((user_id, name, img))
    for role_id in member["roles"]:
        profiles_query.append((user_id, id62(role_id)))


conn = connect(DB_PATH)
cur = conn.cursor()
cur.execute("CREATE TABLE users(id TEXT, name TEXT, thumbnail TEXT)")
cur.execute("CREATE TABLE roles(id INTEGER, role TEXT, attribute TEXT)")
cur.execute("CREATE TABLE notes(id TEXT, user_id TEXT, title TEXT, updated_at INTEGER)")
cur.execute("CREATE TABLE unreads(user_id TEXT, note_id TEXT)")
cur.execute("CREATE TABLE profiles(user_id TEXT, role_id INTEGER)")
cur.execute("CREATE TABLE permissions(note_id TEXT, role_id INTEGER, operation TEXT)")
cur.execute("CREATE TABLE tokens(user_id INTEGER, token TEXT, expires_at INTEGER)")
cur.executemany("INSERT INTO users VALUES (?, ?, ?)", users_query)
cur.executemany("INSERT INTO roles VALUES (?, ?, ?)", roles_query)
cur.executemany("INSERT INTO profiles VALUES (?, ?)", profiles_query)
cur.execute("INSERT INTO users VALUES('ym4F1XcR8k','うり','822720457718759434/7958dfc5b9265cbef9d2905428cb8129')")


delete_roles = ["グーグルフォーム未回答", "体験入部", "要確認", "guest", "BOT"]
cur.execute("""
    SELECT users.id, users.name FROM users
    INNER JOIN profiles ON users.id = profiles.user_id
    INNER JOIN roles ON roles.id = profiles.role_id
    WHERE roles.role IN ({})
    """.format(','.join('?' * len(delete_roles))), delete_roles)
delete_users = cur.fetchall()
print(delete_users)
cur.execute("""
    DELETE FROM users WHERE id IN ({})
    """.format(','.join('?' * len(delete_users))), [a for (a, b) in delete_users])


conn.commit()
conn.close()