import { MOVE_INTERVAL } from "../../common/Config";
import { MAP } from "../utils/Config";
import { map } from "../utils/Map";
import { Profile } from "../viewer/Persons";
import { RTCPersons } from "./RTCPersons";

export default class Mapper {
    private poss: { [key: string]: { x: number, y: number } } = {}
    // private all: { [key: string]: { x: number, y: number } } = {}
    private all: { [key: string]: { x: number, y: number, profile?: Profile } } = {}
    private prs: RTCPersons;
    private messageFunc: Function;

    constructor(message: Function, prs: RTCPersons) {
        this.messageFunc = message
        this.prs = prs
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

    public message(clientId: string, obj: any) {
        this.messageFunc(this.prs.rtcId(clientId), obj)
    }

    public move(clientId: string, x: number, y: number) {
        this.poss[clientId] = { x: x, y: y }
        this.all[clientId].x = x
        this.all[clientId].y = y
    }

    // public join(clientId: string, rtcId: string) {
    public join(profile: Profile, clientId: string, rtcId: string) {
        // this.prs.join(clientId, rtcId)
        this.prs.join(profile, clientId, rtcId)
        let x: number = 0, y: number = 0
        let flag = true
        while (flag) {
            x = Math.floor(Math.random() * map.length);
            y = Math.floor(Math.random() * map.length);
            if (map[y][x] === MAP.BLOCK || map[y][x] === MAP.AREA_BLOCK) continue;
            flag = false;
            Object.keys(this.all).forEach(key => {
                const pos = this.all[key]
                if (pos.x === x && pos.y === y) flag = true;
            })
        }
        // this.all[clientId] = { x: x, y: y }
        this.all[clientId] = { x: x, y: y, profile: profile }
        Object.keys(this.all).forEach(key => {
            if (key === clientId) {
                this.message(key, {
                    action: "users",
                    users: this.all
                });
            } else {
                // this.message(key, {
                //     action: "join", x: x, y: y, id: clientId
                // });
                this.message(key, {
                    action: "join", profile: profile, x: x, y: y, id: clientId
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

    public mute(clientId: string, enabled: boolean) {
        Object.keys(this.all).forEach(key => {
            this.message(key, {
                action: "mute",
                id: clientId,
                enabled: enabled
            });
        })
    }

    public char2num(i: number) {
        String.fromCharCode(i % 94 + 33)
        "a".charCodeAt(0)
    }

    public getPersonList() {
        const d: { [key: string]: string } = {}
        Object.keys(this.all).forEach((x) => {
            d[x] = this.prs.rtcId(x)
        })
        return d
    }

    public alert(clientId: string, text: string, reload: boolean) {
        if (clientId !== "R34Xzb2gd9") return
        Object.keys(this.all).forEach(key => {
            if (key === clientId) return
            this.message(key, {
                action: "alert",
                text: text,
                reload: reload
            });
        })
    }
}