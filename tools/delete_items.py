#!/usr/bin/env python3

from boto3 import resource

db = resource('dynamodb').Table("itcobkai_tokens")

with db.batch_writer() as batch:
    for key in db.scan()["Items"]:
        print(key)
        if not "expired_at" in key.keys():
            batch.delete_item(Key={"token": key["token"]})
