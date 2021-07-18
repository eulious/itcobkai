
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