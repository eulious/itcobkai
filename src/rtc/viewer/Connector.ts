import { map } from "../utils/Map";
import { MAP } from "../utils/Config";
import { Person } from "./Person";

export interface Position {
    x: number;
    y: number;
    id: string;
}

export interface Connection {
    connect: string[]
    disconnect: string[]
    all: Person[]
}

// 音声の 接続/切断 命令を生成するクラス
export class Connector {
    public connectings: Set<string> = new Set()
    public onChange: Function | undefined;
    private area = new Set<number>()

    public update(x: number, y: number, others: Person[]) {
        const reds: Person[] = []
        const whites: Person[] = []
        others.forEach(p => {
            if (map[p.y][p.x] === MAP.AREA || map[p.y][p.x] === MAP.AREA_BLOCK) reds.push(p)
            else whites.push(p)
        })
        const group = (map[y][x] == MAP.PLAIN)
            ? this.inWhite(x, y, whites)
            : this.inRed(x, y, reds)
        const state: Connection = { ...this.diff(group), all: others }
        const isChange = state.connect.length || state.disconnect.length
        this.connectings = group
        return { isChange: isChange, state: state }
    }


    private diff(group: Set<string>) {
        return {
            connect: [...group].filter(v => (!this.connectings.has(v))),
            disconnect: [...this.connectings].filter(v => (!group.has(v))),
        }
    }


    private inRed(x: number, y: number, others: Person[]): Set<string> {
        const group = new Set<string>()
        if (!this.area.has(x * 1000 + y)) this.area = this.makeArea(x, y)
        for (let p of others) {
            if (this.area.has(p.x * 1000 + p.y)) {
                group.add(p.id!)
            }
        }
        return group
    }


    private makeArea(x: number, y: number): Set<number> {
        const reds = new Set<number>([x * 1000 + y])
        const stack: number[] = [x * 1000 + y]
        const checkeds = new Set<number>()

        function checkCell(x: number, y: number) {
            if (checkeds.has(x * 1000 + y)) return;
            if (x < 0 || map.length <= x || y < 0 || map.length <= y) return;
            if (map[y][x] !== MAP.AREA && map[y][x] !== MAP.AREA_BLOCK) return
            checkeds.add(x * 1000 + y)
            stack.push(x * 1000 + y)
            reds.add(x * 1000 + y)
        }

        for (let i = 0; i < 1000; i++) {
            if (!stack.length) break
            const p = stack.pop()!
            const xx = Math.floor(p / 1000)
            const yy = p % 1000
            checkCell(xx, yy + 1);
            checkCell(xx, yy - 1);
            checkCell(xx + 1, yy);
            checkCell(xx - 1, yy);
        }
        return reds
    }


    private inWhite(x: number, y: number, others: Person[]) {
        const stack: Position[] = [{ x: x, y: y, id: "player" }]
        const checkeds = new Set<number>()
        const dict: { [key: number]: Person } = {}
        const group = new Set<string>()
        for (let p of others) dict[p.x * 1000 + p.y] = p

        function checkCell(x: number, y: number) {
            const address = x * 1000 + y
            if (checkeds.has(address)) return;
            if (x < 0 || map.length <= x || y < 0 || map.length <= y) return;
            if (map[y][x] === MAP.AREA || map[y][x] === MAP.AREA_BLOCK) return;

            checkeds.add(address)
            if (address in dict) {
                const p = dict[address]
                stack.push({ x: p.x, y: p.y, id: p.id! })
                group.add(p.id!)
            }
        }

        let i = 0
        while (stack.length) {
            i++
            if (i > 1000) window.alert("white stop!!!")
            const p = stack.pop()!
            checkCell(p.x, p.y);
            checkCell(p.x + 1, p.y + 1);
            checkCell(p.x + 1, p.y - 1);
            checkCell(p.x - 1, p.y + 1);
            checkCell(p.x - 1, p.y - 1);
            checkCell(p.x, p.y + 2);
            checkCell(p.x, p.y - 2);
            checkCell(p.x + 2, p.y);
            checkCell(p.x - 2, p.y);
            checkCell(p.x, p.y + 1);
            checkCell(p.x, p.y - 1);
            checkCell(p.x + 1, p.y);
            checkCell(p.x - 1, p.y);
        }
        return group
    }
}