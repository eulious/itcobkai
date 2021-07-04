#!/usr/bin/env python3

from os import remove
from boto3 import resource
from random import random, seed
from sqlite3 import connect


class Cursor:
    remote_db = "itcobkai.db"
    local_db = f"{seed()}{str(random())[2:]}.db"
    bucket = resource('s3').Bucket("itcobkai-internal")


    def __init__(self):
        Cursor.bucket.download_file(Cursor.remote_db, Cursor.local_db)

    
    def __call__(self):
        return self.__Cursor(self.local_db)
    

    def save(self):
        Cursor.bucket.upload_file(Cursor.local_db, Cursor.remote_db)
        remove(Cursor.local_db)


    def close(self):
        remove(Cursor.local_db)


    class __Cursor:
        def __init__(self, dbname):
            self.conn = connect(dbname)
            self.cur = self.conn.cursor()
            self.is_open = True
        

        def __enter__(self):
            return self


        def __del__(self):
            self.close()


        def __exit__(self, *args):
            self.close()
        

        def close(self):
            if self.is_open:
                self.conn.commit()
                self.conn.close()
                self.is_open = False
        

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