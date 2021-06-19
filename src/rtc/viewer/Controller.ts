import { Connection, Connector } from "./Connector";
import Cropper, { Crop } from "./Cropper";
import { Persons, Profile } from "./Persons";
import StageBuilder from "./StageBuilder";

export default class Controller {
    private cropper: Cropper;
    private prs?: Persons;
    private sb?: StageBuilder;
    private cn = new Connector()

    private message?: Function;
    private inThrottle = false
    private old: Crop;
    get id(): string { return this.prs!.player.id! }

    constructor() {
        this.cropper = new Cropper(0, 0)
        this.old = this.cropper.get()
        window.addEventListener("resize", () => this.refresh())
    }

    public init(profiles: { [key: string]: Profile }, message: Function) {
        this.prs = new Persons(profiles)
        this.message = message;
    }

    public initSB(canvas: HTMLCanvasElement) {
        this.sb = new StageBuilder(canvas)
    }

    public start(x: number, y: number) {
        // this.prs!.player.enable(1, 0)
        document.addEventListener("keydown", e => {
            if (e.key === "a") this.move(-1, 0)
            else if (e.key === "w") this.move(0, -1)
            else if (e.key === "s") this.move(0, 1)
            else if (e.key === "d") this.move(1, 0)
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
        if (!this.prs?.persons.length) return
        const now = this.cropper.get()
        const { isChange, state } = this.cn.update(now.x, now.y, this.prs!.persons)
        if (isChange) {
            this.message!({
                action: "audio",
                connect: state.connect,
                disconnect: state.disconnect
            })
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
        setTimeout(() => (this.inThrottle = false), 250)
        const { x, y, top, left } = this.cropper.get()
        if (!this.cropper.canMove(x + xx, y + yy)) return false
        else if (!this.sb!.canMove(x + xx, y + yy)) return false
        return true
    }


    public join(id: string, x: number, y: number) {
        this.prs!.add(id, x, y).then((person) => {
            // this.sm!.join(person)
            this.refresh()
        })
    }


    public leave(id: string) {
        // this.sm!.leave(id)
        this.prs!.leave(id)
        this.refresh()
    }


    private refresh() {
        const { x, y, top, left } = this.cropper.get()
        this.sb!.drawEnv(left, top)
        this.sb!.drawPlayer(this.prs!.player, x - left, y - top)
        this.sb!.drawOthers(this.prs!.persons, left, top)
    }


    public moveOther(users: { [key: string]: { x: number, y: number } }) {
        this.prs!.moves(users)
        this.refresh()
    }
}