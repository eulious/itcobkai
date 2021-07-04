import { LAMBDA_URL } from "./Config";
import Token from "./Token";

const t = new Token()

export async function request(method: "GET" | "POST", api: string, auth: "db" | "discord" | "", post: any = {}): Promise<any> {
    if (auth) post._access = await t.get(auth)
    if (auth === "db") post._id = localStorage._id
    post._api = api
    post._method = method
    console.log(api, post)
    const res = await fetch(LAMBDA_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(post)
    });
    if (res.status === 401 || res.status === 402) {
        const d = await res.json();
        window.alert(`認証に失敗しました: ${d.detail}`)
        localStorage.removeItem("_id")
        // location.href = location.href.split("?")[0] + "?mode=auth"
    }
    const d = await res.json();
    console.log(d)
    if (d.status === "ng") console.error(d.detail, false);
    return d
}


export async function request2(method: "GET" | "POST", api: string, post: any = {}, auth = true): Promise<any> {
    if (auth) {
        post._access = await t.get("db")
        post._id = localStorage._id
    }
    post._api = api
    post._method = method
    console.log(api, post)
    const res = await fetch(LAMBDA_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(post)
    });
    if (res.status === 401) {
        const d = await res.json();
        window.alert(`認証に失敗しました: ${d.detail}`)
        location.href = location.href.split("?")[0] + "?mode=auth"
    }
    const d = await res.json();
    console.log(d)
    if (d.status === "ng") window.alert(d.detail);
    return d
}


export function getParam(): { [key: string]: string } {
    const obj: { [key: string]: string } = {};
    location.search.substring(1).split("&")
        .map(s => s.split("="))
        .forEach(arr => obj[arr[0]] = arr[1]);
    return obj
}


export function throttle(func: Function, limit: number): Function {
    let inThrottle: boolean;
    return function (this: any): any {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            inThrottle = true;
            func.apply(context, args);
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}


export default class Token2 {
    private c: { [key: string]: string } = {}
    private d: { [key: string]: string } = {}
    private encode = (s: string) => Array.from(s).map(x => this.c[x] ? this.c[x] : x).join('')
    private decode = (s: string) => Array.from(s).map(x => this.d[x] ? this.d[x] : x).join('')

    constructor() {
        const a = 'BsEaXfLKFHpxk1DSwTu4ycAQVitN70z6dgbjYJ2ZPCvWI8OGRUnmMqr5l3oh9e'
        const b = '1Nd6GmgkahSX0f3e8TMlFR4oOJHEC5Bsrx9jIipAvVWnYu2wqPzLDbKcUyZ7Qt'
        for (let i = 0; i < a.length; i++) {
            this.c[a[i]] = b[i]
            this.d[b[i]] = a[i]
        }
    }

    public async get(): Promise<string> {
        if (Number(localStorage.expires_at) > new Date().getTime() / 1000) {
            const refresh = this.decode(localStorage.refresh)
            const res = await request2("POST", "/refresh", { _refresh: refresh }, false)
            localStorage.access = this.encode(res.tokens.access);
            localStorage.refresh = this.encode(res.tokens.refresh);
            localStorage.expires_at = res.tokens.expires_at;
        }
        return this.decode(localStorage.access)
    }
}