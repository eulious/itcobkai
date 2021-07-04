import { LAMBDA_URL } from "./Config";
import Token from "./Token";

const t = new Token()

export async function request(method: "GET" | "POST", api: string, post: any = {}, auth = true): Promise<any> {
    if (auth) {
        post._access = await t.get()
        post._id = localStorage._id
    }
    post._api = api
    post._method = method
    console.log("request", api, post)
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
    console.log("response", d)
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