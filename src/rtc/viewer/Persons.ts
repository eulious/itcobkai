import { request } from "../../common/Common";
import { AVATAR_URL } from "../../common/Config";
import { Person } from "./Person";

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

    public async add(id: string, x: number, y: number): Promise<Person> {
        const persons = this.all.filter(p => p.id === id)
        if (persons.length) {
            this.enable(persons[0], x, y)
            this.persons.push(persons[0])
            return persons[0]
        } else {
            const profile = await request("GET", "/user", { id: id }).then(res => res[0])
            const person = this.createPerson(profile, id)
            this.enable(person, x, y)
            this.persons.push(person)
            this.all.push(person)
            return person
        }
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
                console.log(0, enabled)
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
        person.img.src = `${AVATAR_URL}/${person.profile.thumbnail}.png`;
        person.x = x;
        person.y = y;
    }
}