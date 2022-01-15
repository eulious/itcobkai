import { AVATAR_URL, LAMBDA_URL } from "./Config";
import Token from "./Token";

// day.jsの日本語対応
import dayjs_default from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/ja'
dayjs_default.extend(utc)
dayjs_default.extend(timezone)
dayjs_default.tz.setDefault('Asia/Tokyo')
dayjs_default.locale('ja')
export const dayjs = dayjs_default

const t = new Token()

export async function request(method: "GET" | "POST", api: string, post: any = {}, auth = true): Promise<any> {
    // Lambdaと通信
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


export function avator(thumbnail: string) {
    // DiscordアイコンのURLを生成
    return thumbnail.length > 10
        ? `${AVATAR_URL}/avatars/${thumbnail}`
        : `${AVATAR_URL}/embed/avatars/${thumbnail}`
}


export function id62(DIGITS: number = 12) {
    // BigIntの仕様でPythonのようなことはできない
    const range = (a: number, b: number) => [...Array(b - a).keys()].map(x => x + a)
    const A = [...range(48, 58), ...range(65, 91), ...range(97, 123)].map(x => String.fromCharCode(x))
    return Array(DIGITS + 1).fill("").reduce((a, b) => a + A[Math.floor(Math.random() * 62)])
}