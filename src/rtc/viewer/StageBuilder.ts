import CONFIG from "../utils/Config";
import { map } from "../utils/Map";
import { Person } from "./Person";

export default class StageBuilder {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private backImg = new Image()
    private fillColors: { [key: number]: string } = {
        1: "#F7B5F7",
        2: "#9BADD4",
        3: "#B7EBC9",
        4: "#D4CF9B",
        6: "#F8C3A4",
        7: "#888888"
    }

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.resize()
    }

    public drawEnv(left: number, top: number) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawBack(left, top)
        // this.drawMap(left, top)
        // this.drawGrid()
    }

    public canMove(x: number, y: number): boolean {
        return map[y][x] !== 7
    }

    private drawMap(left: number, top: number) {
        let grid = this.canvas.width / CONFIG.OUTER;
        for (let i = 0; i < CONFIG.OUTER; ++i) {
            for (let j = 0; j < CONFIG.OUTER; ++j) {
                if (map[i + top][j + left] === 0) continue
                const color = map[i + top][j + left]
                this.ctx.fillStyle = this.fillColors[color]
                this.ctx.fillRect(j * grid, i * grid, grid, grid)
            }
        }
    }

    public drawPlayer(player: Person, i: number, j: number) {
        this.drawPerson(player, i, j)
    }

    public drawOthers(persons: Person[], left: number, top: number) {
        for (let person of persons) {
            if (person.x - left < 0 || CONFIG.OUTER <= person.x - left) continue
            if (person.y - top < 0 || CONFIG.OUTER <= person.y - top) continue
            this.drawPerson(person, person.x - left, person.y - top)
        }
    }

    public drawPerson(person: Person, i: number, j: number) {
        const grid = this.canvas.width / CONFIG.OUTER;
        this.ctx.beginPath();
        this.ctx.arc(i * grid + grid / 2, j * grid + grid / 2, grid / 2, 0, Math.PI * 2, false)
        this.ctx.save()
        this.ctx.clip()
        this.ctx.drawImage(person.img, i * grid, j * grid, grid, grid)
        this.ctx.restore()
    }

    private drawBack(left: number, top: number) {
        if (!this.backImg.src) this.backImg.src = "./assets/back.jpg"
        const canvasGrid = this.canvas.width / map.length
        const imgGrid = this.backImg.width / map.length
        this.ctx.drawImage(this.backImg,
            imgGrid * left, imgGrid * top, imgGrid * CONFIG.OUTER, imgGrid * CONFIG.OUTER,
            0, 0, this.canvas.width, this.canvas.height
        )
    }

    private drawGrid() {
        this.ctx.strokeStyle = '#ddd';
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
        const maxWidth = window.innerWidth - 250 - 300;
        const maxHeight = window.innerHeight - 250;
        const size = Math.min(maxHeight, maxWidth)
        this.canvas.width = size
        this.canvas.height = size
    }
}