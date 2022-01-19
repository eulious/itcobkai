#!/usr/bin/env python3

from json import load, dumps
from hashlib import blake2b

JSON_PATH = "../local/210918_105233.json"
OUT_PATH = "../lambda/profiles.py"
DELETE_ROLES = ["グーグルフォーム未回答", "体験入部", "要確認", "guest", "BOT"]

def id62(num):
    uid = ""
    A = [chr(i) for i in [*range(48, 58), *range(65, 91), *range(97, 123)]]
    while num:
        num, m = divmod(num, 62)
        uid = A[m] + uid
    return uid

def id7(num):
    return id62(int(blake2b(str(num).encode(), digest_size=5).hexdigest(), 16))

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
users = {}
d = load(open(JSON_PATH))

for role in d["roles"]:
    if role["name"] in DELETE_ROLES:
        continue
    role_id = id7(role["id"])
    name = proofread(role["name"])
    roles[role_id] = [name, annotate(name)]

for member in d["members"]:
    user_id = id7(member["id"])
    img = member["img"].split("avatars/")[1].split("?")[0]
    name = member["nickname"] if member["nickname"] else member["name"]
    user_roles = []
    for role_id in member["roles"]:
        role_id = id7(role_id)
        if role_id not in roles:
            break
        if roles[role_id][0] == "@everyone":
            continue
        user_roles.append(role_id)
    else:
        users[user_id] = [name, img, user_roles]

for role_id, [role, _] in roles.items():
    if role == "@everyone":
        break
roles.pop(role_id)

# stringify = lambda x: dumps(x, ensure_ascii=False, indent=2)
stringify = lambda x: dumps(x, ensure_ascii=False, separators=(",", ":"))
users['C3kjj1X'] = ['うり', '822720457718759434/7958dfc5b9265cbef9d2905428cb8129', []]
# open(OUT_PATH, "wt").write(f"ROLES={stringify(roles)}\nUSERS={stringify(users)}")

#  ===== lambda_function ====
ROLES = roles
USERS = users
profiles = {}
roles = {}

for [role, attr] in ROLES.values():
    if attr in roles:
        roles[attr].append(role)
    else:
        roles[attr] = [role]

for id, [name, thumbnail, user_roles] in USERS.items():
    profiles[id] = {
        "name": name,
        "thumbnail": thumbnail,
        "year": None,
        "faculty": None,
        "member": {"dtm": False, "cg": False, "prog": False, "mv": False}
    }
    for role_id in user_roles:
        role, attr = ROLES[role_id]
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
open(OUT_PATH, "wt").write(f"PROFILES={str(profiles).replace(' ', '')}")