import React, { useMemo, useState } from "react"
import { RTC_CORE } from "../utils/Config";
import { request } from "../../common/Common";
import ClientAudio from "./ClientAudio";
import Background from "./Background";
import Mapper from "./Mapper";
import RTC from "../rtc/rtc";
import "./style.scss"

export default function Master() {
    const rtc = useMemo(() => new RTC(RTC_CORE).Master, [])
    const mp = useMemo(() => new Mapper(rtc.message), [])
    const [players, setPlayers] = useState<JSX.Element[]>()

    async function start() {
        const res = await request("GET", "/login/master", "db")
        if (res.keys) {
            rtc.KEYS = res.keys
            const streams = await rtc.start(whenOpen, receive)
            mp.streams = streams
        } else {
            console.error("実行権限がありません")
        }
    }

    async function debug() {
        const osc = mp.streams!.ctx.createOscillator();
        const gain = mp.streams!.ctx.createGain();
        gain.gain.value = 0.2;
        osc.connect(gain)
        gain.connect(mp.streams!.ctx.destination)
        osc.start()
        rtc.keys().forEach(async (key) => { osc.connect(mp.streams!.dests[key]) })
        await new Promise(resolve => setTimeout(resolve, 2000))
        rtc.keys().forEach(async (key) => { osc.disconnect(mp.streams!.dests[key]) })
        osc.stop()
    }

    function whenOpen(clientId: string) {
        mp.join(clientId)
        makePlayers()
    }

    function makePlayers() {
        setPlayers(Object.keys(mp.streams!.raw).map((id, i) => {
            return (<ClientAudio audio={mp.streams!.raw[id]}
                key={i}
                clientId={id} />)
        }))
    }

    function receive(e: any, clientId: string) {
        const res = e.data ? JSON.parse(e.data) : JSON.parse(e);
        console.log(`[[[receive]]]: ${clientId}`, res)
        let out: any = { clientId: clientId };
        switch (res.action) {
            case "chat":
                out.action = "chat"
                out.message = `${res.message}\n`
                break;
            case "move":
                mp.move(clientId, res.x, res.y)
                break;
            case "join":
                mp.join(clientId)
                makePlayers()
                break
            case "leave":
                mp.leave(clientId)
                rtc.close(clientId)
                makePlayers()
                break
            case "audio":
                for (let targetId of res.connect) {
                    mp.streams!.medias[targetId].connect(mp.streams!.dests[clientId])
                    console.log("connect!", targetId, clientId)
                }
                for (let targetId of res.disconnect) {
                    mp.streams!.medias[targetId].disconnect(mp.streams!.dests[clientId])
                    console.log("disconnect!", targetId, clientId)
                }
                break
            case "stop":
                rtc.stop()
            default:
                console.warn("unknown command")
                break;
        }
    }

    return (
        <div>
            <h1>WebRTC Master</h1>
            <div className="btn-flat" onClick={start}>起動</div>
            <div className="btn-flat" onClick={() => rtc.stop}>停止</div>
            <div className="btn-flat" onClick={debug}>debug</div>
            {players}
            <Background />
        </div>
    )
}