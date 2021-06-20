import { LAMBDA_URL } from "./Config";

export async function request(api: string, post: any = {}, oauth = true): Promise<any> {
    post._api = api
    if (oauth) {
        post._id = lsLoad("_id")
        post._token = lsLoad("_token")
    }
    const res = await fetch(LAMBDA_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(post)
    });
    const d = await res.json();
    if (d.status === "ng") console.error(d.detail, false);
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


const a = 'BsEaXfLKFHpxk1DSwTu4ycAQVitN70z6dgbjYJ2ZPCvWI8OGRUnmMqr5l3oh9e'
const b = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const c: { [key: string]: string } = {}
const d: { [key: string]: string } = {}
for (let i = 0; i < a.length; i++) {
    c[a[i]] = b[i]
    d[b[i]] = a[i]
}

export function lsSave(key: string, word: string) {
    // const mm = CryptoJS.AES.encrypt(word, AES).toString()
    const mm = Array.from(word).map(x => c[x] ? c[x] : x).join('')
    localStorage[key] = mm
}


export function lsLoad(key: string): string | undefined {
    const mm = localStorage[key] as string
    if (mm) return Array.from(mm).map(x => d[x] ? d[x] : x).join('')
    // if (mm) return CryptoJS.AES.decrypt(mm, AES).toString(CryptoJS.enc.Utf8)
}