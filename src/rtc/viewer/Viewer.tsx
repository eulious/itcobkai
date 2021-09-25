import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Connection } from "./Connector";
import { useHistory } from "react-router";
import { RTC_CORE } from "../utils/Config";
import { Checkbox } from "../../common/BaseComponents";
import { Context } from "../../common/Context";
import useInterval from "../../common/Hooks";
import MainWindow from "./MainWindow";
import Controller from "./Controller";
import SideMenu from "./SideMenu";
import Header from "../../main/Header";
import RTC from "../rtc/rtc";

// ボイスチャット画面
// 親コンポーネント: main.Main
export default function Viewer() {
    const { state } = useContext(Context)
    const [mode, setMode] = useState("normal")
    const [conn, setConn] = useState<Connection>()
    const rtc = useMemo(() => new RTC(RTC_CORE).Viewer, [])
    const [mutes, setMutes] = useState<Set<string>>(new Set())
    const ct = useMemo(() => new Controller(), []);
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const localAudio = useRef<HTMLAudioElement>(null)
    const remoteAudio = useRef<HTMLAudioElement>(null)
    const history = useHistory()

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
        rtc.KEYS = state.keys
        // ct.init(state.profiles, rtc.message)
        // rtc.start(ct.player!.profile, ct.player!.id, localAudio.current!, remoteAudio.current!, receive)
        ct.init(state.profiles, console.log)
        ct.start(5, 4)
        ct.join(state.profiles["2Jc4uot"], "2Jc4uot", 6, 7)
        ct.join(state.profiles["C3kjj1X"], "C3kjj1X", 6, 6)
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

    function edit() {
        const id = ct.player!.id
        if (id) history.push(`${location.pathname}?mode=note&note=${id}&edit=true`)
    }

    return (
        <div>
            <Header mode="rtc" >
                <div /><div className="btn-flat" onClick={edit}>編集</div>
            </Header>
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
                        <MainWindow mode={mode} canvasRef={canvasRef} />
                        <td className="viewer__side_wrapper">
                            <SideMenu
                                conn={conn}
                                player={ct.player}
                                mode={mode}
                                setMode={setMode}
                                mutes={mutes} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}