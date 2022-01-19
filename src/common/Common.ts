import { AVATAR_URL } from "./Config";

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


export function beep() {
    // 動作確認用の音を鳴らす
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => osc.stop(), 200)
}