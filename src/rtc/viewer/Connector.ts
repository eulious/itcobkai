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

export class Connector {
    public connectings: Set<string> = new Set()
    public onChange: Function | undefined;

    public update(x: number, y: number, others: Person[]) {
        const reds: Person[] = []
        const whites: Person[] = []
        others.forEach(p => {
            if (map[p.y][p.x] === 6) reds.push(p)
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

    private inRed(x: number, y: number, others: Person[]) {
        const group = new Set<string>()
        for (let p of others) {
            if (this.IsSameArea({ x: x, y: y }, p)) {
                group.add(p.id!)
            }
        }
        return group
    }

    private IsSameArea(p1: { x: number, y: number }, p2: Person) {
        // ブロックは必ず四角であるという想定
        const y = Math.min(p1.y, p2.y)
        for (let x = Math.min(p1.x, p2.x); x < Math.max(p1.x, p2.x); x++) {
            if (map[y][x] !== 6) {
                console.log(x, y)
                return false
            }
        }
        const x = Math.max(p1.x, p2.x)
        for (let y = Math.min(p1.y, p2.y); y < Math.max(p1.y, p2.y); y++) {
            if (map[y][x] !== 6) {
                console.log(x, y)
                return false
            }
        }
        return true
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
            if (map[y][x] === MAP.AREA) return;

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
            if (i > 1000) console.log("stop!!!")
            const p = stack.pop()!
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