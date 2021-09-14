#!/usr/bin/env python3

from os import remove, getenv
from keys import S3_INTERNAL
from time import time
from boto3 import resource
from sqlite3 import connect


class Cursor:
    def __init__(self):
        self.is_lambda = bool(getenv("AWS_LAMBDA_FUNCTION_VERSION"))
        self.local_db = f'{"/tmp/" if self.is_lambda else ""}{str(time()).replace(".", "")}.db'
        self.remote_db = "itcobkai.db"
        self.bucket = resource('s3').Bucket(S3_INTERNAL)
        self.bucket.download_file(self.remote_db, self.local_db)
        self.conn = connect(self.local_db)
        self.cur = self.conn.cursor()
    

    def save(self, is_remove=True):
        self.conn.commit()
        if is_remove:
            self.conn.close()
            if self.is_lambda:
                self.bucket.upload_file(self.local_db, self.remote_db)
                remove(self.local_db)


    def delete(self):
        self.conn.close()
        if self.is_lambda:
            remove(self.local_db)


    def execute(self, query, params=[]):
        if len(params) == 0:
            self.cur.execute(query)
        else:
            self.cur.execute(query, params)
        return self.cur.fetchall()


    def executemany(self, query, params=[]):
        self.cur.executemany(query, params)
        return self.cur.fetchall()
    

    def executein(self, query, array):
        self.cur.execute(query%','.join('?'*len(array)), array)
        return self.cur.fetchall()