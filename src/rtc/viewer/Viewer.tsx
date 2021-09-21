import React, { useEffect, useMemo, useRef, useState } from "react";
import { Connection } from "./Connector";
import { RTC_CORE } from "../utils/Config";
import { request } from "../../common/Common";
import useInterval from "../../common/Hooks";
import Controller from "./Controller";
import SideMenu from "./SideMenu";
import Header from "../../main/Header";
import RTC from "../rtc/rtc";

// ボイスチャット画面
// 親コンポーネント: main.Main
export default function Viewer() {
    const [conn, setConn] = useState<Connection>()
    const rtc = useMemo(() => new RTC(RTC_CORE).Viewer, [])
    const [mutes, setMutes] = useState<Set<string>>(new Set())
    const ct = useMemo(() => new Controller(), []);
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const localAudio = useRef<HTMLAudioElement>(null)
    const remoteAudio = useRef<HTMLAudioElement>(null)

    useInterval(() => {
        const conn = ct.getConnection()
        if (conn) setConn(conn)
    }, 500)

    useEffect(() => {
        ct.initSB(canvasRef.current!);
        (window as any).reload = (text: string) => ct.alert(text, true);
        (window as any).message = (text: string) => ct.alert(text, false);
    }, [])

    async function start() {
        const res = await request("GET", "/rtc/init")
        rtc.KEYS = res.keys
        ct.init(res.profiles, rtc.message)
        rtc.start(ct.player!.profile, ct.player!.id, localAudio.current!, remoteAudio.current!, receive)
        // ct.init(res.profiles, console.log)
        // ct.start(5, 4)
        // ct.join(res.profiles["WOzosMqMAy"], "WOzosMqMAy", 6, 7)
        // ct.join(res.profiles["ym4F1XcR8k"], "ym4F1XcR8k", 6, 6)
        // Object.keys(res.profiles).forEach(key => { ct.join(res.profiles[key], key, Math.floor(Math.random() * 24), Math.floor(Math.random() * 24)) })
        setConn(ct.getConnection())
    }

    useEffect(() => {
        window.addEventListener("resize", () => ct.refresh())
        window.addEventListener('beforeunload', () => rtc.stop())
    }, [])

    function receive(e: any) {
        const res = e.data ? JSON.parse(e.data) : JSON.parse(e);
        console.log("[[[receive]]]: ", res)
        switch (res.action) {
            case "alert":
                window.alert(res.text)
                if (res.reload) location.reload()
                break;
            case "join":
                // ct.join(res.id, res.x, res.y)
                ct.join(res.profile, res.id, res.x, res.y)
                break;
            case "move":
                ct.moveOther(res.poss)
                break;
            case "mute":
                if (res.enabled) mutes.add(res.id)
                else mutes.delete(res.id)
                setMutes(new Set(mutes))
                ct.mute(res.enabled, res.id)
                break;
            case "leave":
                ct.leave(res.id)
                break;
            case "alert":
                window.alert(res.text)
                break;
            case "users":
                Object.keys(res.users).forEach((clientId: string) => {
                    const user = res.users[clientId]
                    if (clientId === ct.player!.id) {
                        ct.start(user.x, user.y)
                    } else {
                        // ct.join(clientId, user.x, user.y)
                        ct.join(user.profile, clientId, user.x, user.y)
                    }
                });
                break;
            default:
                console.warn("unknown command")
                break;
        }
    }

    function mute(enabled: boolean) {
        const id = ct.player!.id
        if (enabled) mutes.add(id)
        else mutes.delete(id)
        setMutes(new Set(mutes))
        ct.mute(enabled)
    }

    return (
        <div>
            <Header mode="rtc" />
            <table className="viewer__wrapper">
                <tbody>
                    <tr>
                        <td>
                            <div className="debug">
                                <audio ref={localAudio} muted autoPlay playsInline controls={false}></audio>
                                <audio ref={remoteAudio} autoPlay playsInline controls={false}></audio>
                            </div>
                        </td>
                        <td>
                            <div className="btn-flat" onClick={start}>接続</div>
                            <div className="btn-flat" onClick={() => window.location.reload()}>退席</div>
                            <Checkbox label="消音" onChange={mute} />
                        </td>
                    </tr>
                    <tr>
                        <td className="viewer__canvas_wrapper">
                            <canvas className="viewer__canvas" ref={canvasRef} width="512" height="512"></canvas>
                        </td>
                        <td className="viewer__side_wrapper">
                            <SideMenu conn={conn} player={ct.player} mutes={mutes} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}


function Checkbox(props: { label: string, onChange: Function }) {
    const [checked, setChecked] = useState(false)

    function onChange() {
        props.onChange(!checked)
        setChecked(!checked)
    }

    return (
        <span onClick={onChange}>
            <input type="checkbox" checked={checked} onChange={() => { }} />
            {props.label}
        </span>
    )
}