#!/usr/bin/env python3

from hashlib import blake2b

class CustomError(Exception):
    def __init__(self, code=200, arg=""):
        self.arg = arg
        self.code = code
    
    def __str__(self):
        return str(self.arg)
    
    def __int__(self):
        return self.code if isinstance(self.code, int) else 500


def id62(num):
    uid = ""
    A = [chr(i) for i in [*range(48, 58), *range(65, 91), *range(97, 123)]]
    while num:
        num, m = divmod(num, 62)
        uid = A[m] + uid
    return uid


def id7(num):
    return id62(int(blake2b(str(num).encode(), digest_size=5).hexdigest(), 16))


def blake(text):
    return id62(int(blake2b(text.encode(), digest_size=9).hexdigest(), 16))