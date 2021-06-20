import { LAMBDA } from "./Config";

export async function request(method: "GET" | "PUT" | "POST" | "DELETE", path: string, post?: Object): Promise<any> {
    const res = await fetch(`${LAMBDA}&api=${path}`, {
        method: method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.token}`
        },
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
