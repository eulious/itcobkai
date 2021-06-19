import { MOVE_INTERVAL } from "../../common/Config";
import { MAP } from "../utils/Config";
import { map } from "../utils/Map";
import { Streams } from "../utils/Schema";

export default class Mapper {
    private poss: { [key: string]: { x: number, y: number } } = {}
    private all: { [key: string]: { x: number, y: number } } = {}
    private message: Function;
    public streams?: Streams

    constructor(message: Function) {
        this.message = message
        setInterval(() => {
            if (!Object.keys(this.poss).length) return
            const info = JSON.stringify({
                action: "move",
                poss: this.poss
            })
            this.poss = {}
            Object.keys(this.all).forEach(key => {
                this.message(key, info)
            })
        }, MOVE_INTERVAL)
    }

    public move(clientId: string, x: number, y: number) {
        this.poss[clientId] = { x: x, y: y }
        this.all[clientId].x = x
        this.all[clientId].y = y
    }

    public join(clientId: string) {
        let x: number = 0, y: number = 0
        let flag = true
        while (flag) {
            x = Math.floor(Math.random() * map.length);
            y = Math.floor(Math.random() * map.length);
            if (map[y][x] === MAP.BLOCK) continue;
            flag = false;
            Object.keys(this.all).forEach(key => {
                const pos = this.all[key]
                if (pos.x === x && pos.y === y) flag = true;
            })
        }
        this.all[clientId] = { x: x, y: y }
        console.log("random", x, y)
        Object.keys(this.all).forEach(key => {
            if (key === clientId) {
                this.message(key, {
                    action: "users",
                    users: this.all
                });
            } else {
                this.message(key, {
                    action: "join", x: x, y: y, id: clientId
                });
            }
        })
    }

    public leave(clientId: string) {
        delete this.all[clientId]
        Object.keys(this.all).forEach(key => {
            this.message(key, {
                action: "leave",
                id: clientId
            });
        })
    }

    public char2num(i: number) {
        String.fromCharCode(i % 94 + 33)
        "a".charCodeAt(0)
    }
}