/** @jsx jsx */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useInterval, useTransition } from "../common/Hooks";
import { Connection } from "../map/Connector";
import { Checkbox } from "../common/BaseComponents";
import { RTC_CORE, S3_URL } from "../common/Config";
import { Context } from "../common/Context";
import MainWindow from "./MainWindow";
import SideMenu from "./SideMenu";
import { css, jsx } from '@emotion/react'
import Header from "../main/Header";
import RTC from "../rtc/rtc";
import { Button, styleValue } from "../common/Style";
import Controller from "../map/Controller";

// ボイスチャット画面
// 親コンポーネント: main.Main
export default function Viewer() {
    const { state, dispatch } = useContext(Context)
    const [mutes, setMutes] = useState<Set<string>>(new Set())
    const [mode, setMode] = useState("normal")
    const [conn, setConn] = useState<Connection>()
    const transition = useTransition()
    const remoteAudio = useRef<HTMLAudioElement>(null)
    const localAudio = useRef<HTMLAudioElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rtc = useMemo(() => new RTC(RTC_CORE).Viewer, [])
    const ct = useMemo(() => new Controller(), []);

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
        ct.init(state.id, state.profiles, console.log)
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

    function manual() {
        window.open(`${S3_URL}/manual.pdf`)
    }

    return (
        <div>
            <Header mode="rtc">
                <div css={style.right}>
                    <Button onClick={manual}>操作説明</Button>
                </div>
            </Header>
            <table css={style.wrapper}>
                <tbody>
                    <tr>
                        <td>
                            <div>
                                <audio ref={localAudio} muted autoPlay playsInline controls={false}></audio>
                                <audio ref={remoteAudio} autoPlay playsInline controls={false}></audio>
                            </div>
                        </td>
                        <td>
                            <Button onClick={start}>接続</Button>
                            <Button onClick={() => window.location.reload()}>退席</Button>
                            <Checkbox label="消音" onChange={mute} />
                        </td>
                    </tr>
                    <tr>
                        <MainWindow
                            mode={mode}
                            canvasRef={canvasRef} />
                        <td css={style.side}>
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


const style = {
    right: css({
        display: "flex",
        padding: "2px 20px 0px 0px",
    }),

    wrapper: css({
        background: styleValue.black2,
        border: "2px solid $black1",
        margin: "20px auto 0px",
        padding: "0 1em",
    }),

    side: css({
        verticalAlign: "top",
        width: "250px"
    })
}