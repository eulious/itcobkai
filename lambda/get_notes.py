#!/usr/bin/env python3

from aws import Cursor
from utils import CustomError, auth

def get_notes(post):
    cur = Cursor()
    auth(cur, post["_id"], post["_access"])
    notes, name = _get_notes(post["_id"], cur)
    roles = get_roles(cur),
    cur.delete()
    return { "name": name, "roles": roles, "authors": notes }


def get_roles(cur):
    res = cur.execute("SELECT role, attribute FROM roles")
    roles = {}
    for role, attr in res:
        if attr not in roles:
            roles[attr] = []
        roles[attr].append(role)
    return roles


def _get_notes(my_id, cur):
    unreads = set()
    res = cur.execute("SELECT note_id FROM unreads WHERE user_id=?",
        (my_id,))
    for note_id in res:
        unreads.add(note_id)
    res = cur.execute("""
        SELECT notes.id, users.name, notes.title, users.id
        FROM notes
        INNER JOIN users ON users.id = notes.user_id
        ORDER BY updated_at DESC
        """)
    d = {}
    users = []
    for id, user, title, user_id in res:
        if user not in d:
            d[user] = []
            users.append(user)
        d[user].append({
            "id": id,
            "title": title,
            "unread": id in unreads,
            "editable": user_id == my_id
        })
    out = []
    for user in users:
        out.append({
            "name": user,
            "notes": d[user]
        })
    [(name,)] = cur.execute("SELECT name FROM users WHERE id=?", (my_id,))
    if name not in users:
        out.append({"name": name, "notes": []})
    return out, name


# res = cur.execute("""
#     SELECT notes.id, users.name, notes.title, notes.updated_at FROM notes
#     INNER JOIN users ON users.id = notes.id
#     WHERE id IN (
#         SELECT DISTINCT note_id
#         FROM permission
#         WHERE role_id IN (
#             SELECT role_id
#             FROM profiles
#             WHERE user_id=?
#         )
#     )
#     """, (post["_id"],))