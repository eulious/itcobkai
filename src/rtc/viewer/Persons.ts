import { avator, request } from "../../common/Common";
import { HAKASE } from "../../common/Config";

export interface Person {
    img: HTMLImageElement
    mute: boolean
    profile: Profile
    x: number
    y: number
    id: string
}

export interface Profile {
    name: string
    year: number
    detail: string
    faculty: string
    thumbnail: string
    member: {
        dtm: boolean
        cg: boolean
        prog: boolean
        mv: boolean
    }
}

// プレイヤーの情報を管理するクラス
// 自分自身の座標情報だけはCropperで管理している
export class Persons {
    public player: Person
    public persons: Person[] = [];
    public all: Person[] = [];

    constructor(profiles: { [key: string]: Profile }) {
        const myId = localStorage._id
        this.player = this.createPerson(profiles[myId], myId)
        this.enable(this.player, 0, 0)
        Object.keys(profiles).forEach((id: string) => {
            if (id !== myId) this.all.push(this.createPerson(profiles[id], id))
        })
    }

    public add(profile: Profile, id: string, x: number, y: number) {
        if (this.persons.filter(x => x.id === id).length) return
        const person = this.createPerson(profile, id)
        this.enable(person, x, y)
        this.persons.push(person)
    }

    public moves(users: { [key: string]: { x: number, y: number } }) {
        for (let person of this.persons) {
            if (!(person.id in users)) continue
            person.x = users[person.id].x
            person.y = users[person.id].y
        }
    }

    public leave(id: string) {
        this.persons = this.persons.filter(p => p.id !== id)
    }

    public canMove(x: number, y: number): boolean {
        for (let person of this.persons) {
            if (person.x === x && person.y === y) return false
        }
        return true
    }

    public getByPosition(x: number, y: number): Person | undefined {
        const persons = this.persons.filter(p => p.x === x && p.y === y)
        return persons.length ? persons[0] : undefined
    }

    public mute(enabled: boolean, clientId?: string) {
        if (!clientId) this.player.mute = enabled
        else this.persons.forEach((person, i) => {
            if (person.id === clientId) {
                this.persons[i].mute = enabled
            }
        })
    }

    private createPerson(profile: Profile, id: string): Person {
        return ({
            img: new Image(),
            mute: false,
            profile: profile,
            x: 0,
            y: 0,
            id: id
        })
    }

    private enable(person: Person, x: number, y: number) {
        person.img.src = avator(person.profile.thumbnail);
        person.img.onerror = () => person.img.src = HAKASE
        person.x = x;
        person.y = y;
    }
}