import { LAMBDA_URL } from "./Config";
import Token from "./Token";

const t = new Token()

export async function request(api: string, post: any = {}, auth: "db" | "discord" | "" = ""): Promise<any> {
    if (auth) post._access = await t.get(auth)
    if (auth === "db") post._id = localStorage._id
    post._api = api
    console.log("api")
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
