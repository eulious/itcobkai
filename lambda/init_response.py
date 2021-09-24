#!/usr/bin/env python3

from keys import KEYS, MASTER
from utils import DynamoDB
from profiles import USERS, ROLES

def init_response(post):
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

    author = {}
    for note in DynamoDB("notes").scan():
        name = USERS[note["user_id"]][0]
        if name not in author:
            author[name] = {
                "name": name,
                "notes": []
            }
        author[name]["notes"].append({
           "id": note["id"],
           "updated_at": int(note["updated_at"]),
           "title": note["title"],
           "unread": False,
           "editable": note["user_id"] == post["_id"]
        })

    return {
        "profiles": profiles,
        "keys": KEYS,
        "master": post["_id"] in MASTER,
        "roles": roles, 
        "author": author,
    }