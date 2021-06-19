import { request } from "../../common/Common";
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
        const id = localStorage.token.substring(0, 8)
        this.player = this.createPerson(profiles[id], id)
        this.enable(this.player, 0, 0)
        Object.keys(profiles).forEach((id: string) => {
            if (id !== localStorage.token.substring(0, 8)) {
                // print(`ユーザ情報取得完了: ${profiles[id].name}`)
                this.all.push(this.createPerson(profiles[id], id))
            }
        })
    }

    public async add(id: string, x: number, y: number): Promise<Person> {
        const persons = this.all.filter(p => p.id === id)
        if (persons.length) {
            this.enable(persons[0], x, y)
            this.persons.push(persons[0])
            return persons[0]
        } else {
            const profile = await request("POST", `/users?id=${id}`).then(res => res[0])
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
        this.persons = this.all.filter(p => p.id !== id)
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

    private createPerson(profile: Profile, id: string): Person {
        return ({
            img: new Image(),
            profile: profile,
            x: 0,
            y: 0,
            id: id
        })
    }

    private enable(person: Person, x: number, y: number) {
        person.img.src = `./assets/thumb/${person.profile.thumbnail}.jpg`;
        person.x = x;
        person.y = y;
    }
}