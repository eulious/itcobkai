import { Person, Persons, Profile } from "../viewer/Persons";
import { Connection, Connector } from "./Connector";
import Cropper, { Crop } from "./Cropper";
import StageBuilder from "../viewer/StageBuilder";

// Viewerの肥大化を防ぐため処理部分を全てこちらに分離
export default class Controller {
    private cropper: Cropper;
    private prs?: Persons;
    private sb?: StageBuilder;
    private cn = new Connector()

    private message?: Function;
    private inThrottle = false
    private isPersonChange = false
    private old: Crop;
    get id(): string { return this.prs!.player.id! }
    get player(): Person | undefined { return this.prs?.player }

    constructor() {
        this.cropper = new Cropper(0, 0)
        this.old = this.cropper.get()
    }


    public init(id: string, profiles: { [key: string]: Profile }, message: Function) {
        this.prs = new Persons(id, profiles)
        this.message = message;
    }


    public initSB(canvas: HTMLCanvasElement) {
        this.sb = new StageBuilder(canvas)
        this.sb!.touchAction((xx: number, yy: number) => this.move(xx, yy))
        window.addEventListener("resize", () => {
            this.sb!.resize()
            this.refresh()
        })
    }


    public start(x: number, y: number) {
        document.addEventListener("keydown", e => {
            if (e.key === "a") this.move(-1, 0)
            else if (e.key === "w") this.move(0, -1)
            else if (e.key === "s") this.move(0, 1)
            else if (e.key === "d") this.move(1, 0)
            else if (e.key === "ArrowLeft") this.move(-1, 0)
            else if (e.key === "ArrowUp") this.move(0, -1)
            else if (e.key === "ArrowDown") this.move(0, 1)
            else if (e.key === "ArrowRight") this.move(1, 0)
        })
        setInterval(() => {
            const now = this.cropper.get()
            if (now.x === this.old.x && now.y === this.old.y) return;
            this.message!({ action: "move", x: now.x, y: now.y })
            this.old = now
        }, 500)
        this.cropper = new Cropper(x, y)
        this.prs!.player.img.onload = () => this.refresh()
    }


    public getConnection(): Connection | undefined {
        if (!this.prs?.persons) return
        const now = this.cropper.get()
        const { isChange, state } = this.cn.update(now.x, now.y, this.prs!.persons)
        if (isChange || this.isPersonChange) {
            this.message!({
                action: "audio",
                connect: state.connect,
                disconnect: state.disconnect
            })
            state.all.sort((a, b) => {
                const to_a = (now.x - a.x) ** 2 + (now.y - a.y) ** 2
                const to_b = (now.x - b.x) ** 2 + (now.y - b.y) ** 2
                return to_a - to_b
            })
            this.isPersonChange = false
            return state
        }
    }


    public move(xx: number, yy: number) {
        if (!this.canMove(xx, yy)) return
        this.cropper.move(xx, yy)
        this.refresh()
    }


    private canMove(xx: number, yy: number): boolean {
        if (this.inThrottle) return false
        this.inThrottle = true;
        setTimeout(() => (this.inThrottle = false), 100)
        const { x, y, top, left } = this.cropper.get()
        if (!this.cropper.canMove(x + xx, y + yy)) return false
        else if (!this.sb!.canMove(x + xx, y + yy)) return false
        return true
    }


    public join(profile: Profile, id: string, x: number, y: number) {
        this.isPersonChange = true
        this.prs!.add(profile, id, x, y)
        this.refresh()
    }


    public leave(id: string) {
        this.prs!.leave(id)
        this.refresh()
        this.isPersonChange = true
    }


    public refresh() {
        const { x, y, top, left } = this.cropper.get()
        this.sb!.drawEnv(left, top)
        const players = this.prs!.persons.filter(x => this.cn.connectings.has(x.id))
        const others = this.prs!.persons.filter(x => !this.cn.connectings.has(x.id))
        this.sb!.drawOthers(players, left, top, true)
        this.sb!.drawOthers(others, left, top, false)
        this.sb!.drawPlayer(this.prs!.player, x - left, y - top)
        this.sb!.drawTop(left, top)
    }


    public moveOther(users: { [key: string]: { x: number, y: number } }) {
        this.prs!.moves(users)
        this.refresh()
    }


    public mute(enabled: boolean, clientId?: string) {
        if (!clientId) this.message!({ action: "mute", enabled: enabled })
        this.prs!.mute(enabled, clientId)
        this.refresh()
    }


    public alert(text: string, reload: boolean) {
        this.message!({ action: "alert", reload: reload, text: text })
    }
}