import React, { useEffect, useMemo, useRef, useState } from "react";
import { Connection } from "./Connector";
import { RTC_CORE } from "../utils/Config";
import { request } from "../../common/Common";
import useInterval from "../../common/Hooks";
import Controller from "./Controller";
import SideMenu from "./SideMenu";
import Header from "../../main/Header";
import RTC from "../rtc/rtc";

export default function Viewer() {
    const [conn, setConn] = useState<Connection>()
    const rtc = useMemo(() => new RTC(RTC_CORE).Viewer, [])
    const ct = useMemo(() => new Controller(), []);
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const localAudio = useRef<HTMLAudioElement>(null)
    const remoteAudio = useRef<HTMLAudioElement>(null)

    function switchToken() {
        if (localStorage.token === localStorage.token1) localStorage.token = localStorage.token2
        else localStorage.token = localStorage.token1
        start()
    }

    useInterval(() => {
        const conn = ct.getConnection()
        if (conn) setConn(conn)
    }, 500)

    useEffect(() => {
        ct.initSB(canvasRef.current!)
    }, [])

    async function start() {
        const res = await request("GET", "/init", "discord")
        rtc.KEYS = res.keys
        // ct.init(res.profiles, rtc.message)
        // rtc.start(ct.player!.id, localAudio.current!, remoteAudio.current!, receive)
        ct.init(res.profiles, console.log)
        ct.start(5, 4)
        ct.join("WOzosMqMAy", 6, 7)
        ct.join("ym4F1XcR8k", 5, 6)
        setConn(ct.getConnection())
    }

    async function debug() {
        rtc.message({ action: "join" });
    }

    useEffect(() => {
        window.addEventListener("resize", () => ct.refresh())
        window.addEventListener('beforeunload', () => rtc.stop())
    }, [])

    function receive(e: any) {
        const res = e.data ? JSON.parse(e.data) : JSON.parse(e);
        console.log("[[[receive]]]: ", res)
        switch (res.action) {
            case "chat":
                // $("#viewer .local-message")[0].innerText += `[${res.clientId}]: ${res.message}\n`
                break;
            case "join":
                ct.join(res.id, res.x, res.y)
                break;
            case "move":
                ct.moveOther(res.poss)
                break;
            case "leave":
                ct.leave(res.id)
                break;
            case "users":
                // print("")
                Object.keys(res.users).forEach((clientId: string) => {
                    const user = res.users[clientId]
                    if (clientId === ct.player!.id) {
                        ct.start(user.x, user.y)
                    } else {
                        ct.join(clientId, user.x, user.y)
                    }
                });
                break;
            default:
                console.warn("unknown command")
                break;
        }
    }


    return (
        <div>
            <Header mode="rtc" />
            <table className="viewer__wrapper">
                <tbody>
                    <tr>
                        <td>
                            <div className="debug">
                                <audio ref={localAudio} muted autoPlay playsInline controls></audio>
                                <audio ref={remoteAudio} autoPlay playsInline controls></audio>
                                <button onClick={switchToken}>switch</button>
                                <button onClick={debug}>debug</button>
                            </div>
                        </td>
                        <td>
                            <div className="btn-flat" onClick={start}>接続</div>
                            <div className="btn-flat" onClick={() => rtc.stop()}>体積</div>
                        </td>
                    </tr>
                    <tr>
                        <td className="viewer__canvas_wrapper">
                            <canvas className="viewer__canvas" ref={canvasRef} width="512" height="512"></canvas>
                        </td>
                        <td className="viewer__side_wrapper">
                            <SideMenu conn={conn} player={ct.player} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}