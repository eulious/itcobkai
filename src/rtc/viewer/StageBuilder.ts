import CONFIG, { MAP } from "../utils/Config";
import { ASSETS } from "../../common/Config";
import { Person } from "./Person";
import { map } from "../utils/Map";

// Canvasにマップや人物を描画するクラス
export default class StageBuilder {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private backImg = new Image()
    private topImg = new Image()

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.resize()
    }

    public drawEnv(left: number, top: number) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawBack(left, top)
    }

    public canMove(x: number, y: number): boolean {
        return map[y][x] !== MAP.BLOCK && map[y][x] !== MAP.AREA_BLOCK
    }

    public drawPlayer(player: Person, i: number, j: number) {
        this.drawPerson(player, i, j, true)
    }

    public drawOthers(persons: Person[], left: number, top: number, inside: boolean) {
        for (let person of persons) {
            if (person.x - left < 0 || CONFIG.OUTER <= person.x - left) continue
            if (person.y - top < 0 || CONFIG.OUTER <= person.y - top) continue
            this.drawPerson(person, person.x - left, person.y - top, inside)
        }
    }

    private drawPerson(person: Person, i: number, j: number, inside: boolean) {
        const grid = this.canvas.width / CONFIG.OUTER;
        this.ctx.beginPath();
        this.ctx.arc(i * grid + grid / 2, j * grid + grid / 2, grid / 2, 0, Math.PI * 2, false)
        this.ctx.save()
        this.ctx.globalAlpha = inside ? 1 : 0.6
        this.ctx.clip()
        this.ctx.drawImage(person.img, i * grid, j * grid, grid, grid)
        if (person.mute) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
            this.ctx.fillRect(i * grid, j * grid, grid, grid)
        }
        this.ctx.restore()
    }

    public drawTop(left: number, top: number) {
        if (!this.topImg.src) this.topImg.src = `${ASSETS}/map_t.png`
        const canvasGrid = this.canvas.width / map.length
        const imgGrid = this.topImg.width / map.length
        this.ctx.drawImage(this.topImg,
            imgGrid * left, imgGrid * top, imgGrid * CONFIG.OUTER, imgGrid * CONFIG.OUTER,
            0, 0, this.canvas.width, this.canvas.height
        )
        this.drawGrid()
    }

    private drawBack(left: number, top: number) {
        if (!this.backImg.src) this.backImg.src = `${ASSETS}/map_b.png`
        const canvasGrid = this.canvas.width / map.length
        const imgGrid = this.backImg.width / map.length
        this.ctx.drawImage(this.backImg,
            imgGrid * left, imgGrid * top, imgGrid * CONFIG.OUTER, imgGrid * CONFIG.OUTER,
            0, 0, this.canvas.width, this.canvas.height
        )
    }

    private drawGrid() {
        this.ctx.strokeStyle = 'rgba(200,200,200,0.2)';
        let grid = this.canvas.width / CONFIG.OUTER;
        for (var i = 0; i <= this.canvas.height / grid; ++i) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, grid * i);
            this.ctx.lineTo(this.canvas.width, grid * i);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        for (var i = 0; i <= this.canvas.width / grid; ++i) {
            this.ctx.beginPath();
            this.ctx.moveTo(grid * i, 0);
            this.ctx.lineTo(grid * i, this.canvas.height);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    public resize() {
        const maxWidth = window.innerWidth - 400;
        const maxHeight = window.innerHeight - 190;
        const size = Math.min(maxHeight, maxWidth)
        this.canvas.width = size
        this.canvas.height = size
    }

    public touchAction(move: Function) {
        let touching = false;
        let direction = [0, 0];

        function touched(e: TouchEvent) {
            touching = false
            if (!e.target) return
            const dom = e.target as HTMLElement
            if (dom.className !== "viewer__canvas") return
            e.preventDefault();
            touching = true
            const rect = dom.getClientRects()[0]
            const client = e.changedTouches[0]
            const x = client.clientX - (rect.right + rect.left) / 2
            const y = client.clientY - (rect.bottom + rect.top) / 2
            if (Math.abs(x) <= y) direction = [0, 1] // 下
            else if (Math.abs(y) <= x) direction = [1, 0] // 右
            else if (Math.abs(x) <= -y) direction = [0, -1] // 上
            else if (Math.abs(y) <= -x) direction = [-1, 0] // 左
        }

        setInterval(() => { if (touching) move(...direction) }, 100)
        window.addEventListener("touchstart", e => touched(e))
        window.addEventListener("touchmove", e => touched(e))
        window.addEventListener("touchend", () => touching = false)
        this.canvas.oncontextmenu = function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    }
}