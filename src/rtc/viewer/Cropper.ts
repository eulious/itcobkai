import CONFIG from "../utils/Config";
import { map } from "../utils/Map";

export interface Crop {
    x: number;
    y: number;
    top: number;
    left: number;
}

// プレイヤーの存在するマス周辺を切り出すクラス
// プレイヤーの座標情報はこのクラスで管理
export default class Cropper {
    private OUTER = CONFIG.OUTER;
    private INNER = CONFIG.INNER;
    private _left = 0;
    private _top = 0;
    private _x = 0;
    private _y = 0;
    get left(): number { return this._left }
    get top(): number { return this._top }
    get x(): number { return this._x }
    get y(): number { return this._y }

    constructor(x: number, y: number) {
        this.jump(x, y)
    }

    public canMove(x: number, y: number) {
        if (x < 0 || map.length <= x) return false
        else if (y < 0 || map.length <= y) return false
        else return true
    }

    public move(xx: number, yy: number): Crop {
        this._x += xx
        this._y += yy
        this.updateRect()
        return this.get()
    }

    public jump(x: number, y: number) {
        const range = Math.ceil(this.OUTER / 2);
        this._x = x
        this._y = y
        this._top = this._y - range
        this._left = this._x - range
        this.updateRect()
    }

    private updateRect() {
        if (this._x - this._left >= this.OUTER - this.INNER) this._left += 1
        else if (this._x - this._left < this.INNER) this._left -= 1
        if (this._y - this._top >= this.OUTER - this.INNER) this._top += 1
        else if (this._y - this._top < this.INNER) this._top -= 1
        if (this._left < 0) this._left = 0
        else if (this._left >= map.length - this.OUTER) this._left = map.length - this.OUTER
        if (this._top < 0) this._top = 0
        else if (this._top >= map.length - this.OUTER) this._top = map.length - this.OUTER
    }

    public get(): Crop {
        return {
            x: this.x,
            y: this.y,
            left: this.left,
            top: this.top,
        }
    }
}