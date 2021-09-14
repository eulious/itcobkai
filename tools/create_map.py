#!/usr/bin/env python3

DIR = "assets/map2"
RED = f"{DIR}/map2_赤.csv"
BLACK = f"{DIR}/map2_黒.csv"
OUT = f"{DIR}/Map.ts"

def make_mat(fn):
    mat = []
    for i, line in enumerate(open(fn).readlines()):
        if i%2:
            continue
        arr = []
        line = line.replace("\n", "")
        for j, x in enumerate(line.split(",")):
            if j%2:
                continue
            arr.append(int(x) != -1)
        mat.append(arr)
    return mat

red = make_mat(RED)
black = make_mat(BLACK)

mat = []
for i in range(len(red)):
    arr = []
    for j in range(len(red[i])):
        if red[i][j] and black[i][j]:
            arr.append(3)
        elif red[i][j]:
            arr.append(2)
        elif black[i][j]:
            arr.append(1)
        else:
            arr.append(0)
    mat.append(arr)

open(OUT, "wt").write(f"export const map={mat}")