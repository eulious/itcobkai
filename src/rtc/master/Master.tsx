import React, { useContext, useEffect, useMemo, useState } from "react"
import { RTCPersons } from "./RTCPersons";
import { RTC_CORE } from "../utils/Config";
import { Streams } from "../utils/Schema";
import { Context } from "../../common/Context";
import ClientAudio from "./ClientAudio";
import Mapper from "./Mapper";
import RTC from "../rtc/rtc";

let streams: Streams

// マスター画面
// 親コンポーネント: main.Main
export default function Master() {
    const { state } = useContext(Context)
    const rtc = useMemo(() => new RTC(RTC_CORE).Master, [])
    const prs = useMemo(() => new RTCPersons(), [])
    const mp = useMemo(() => new Mapper(rtc.message, prs), [])
    const [players, setPlayers] = useState<JSX.Element[]>()

    useEffect(() => {
        (window as any).reload = (text: string) => mp.alert("R34Xzb2gd9", text, true);
        (window as any).message = (text: string) => mp.alert("R34Xzb2gd9", text, false);
    }, [])

    async function start() {
        if (state.master) {
            rtc.KEYS = state.keys
            prs.set(state.profiles)
            streams = await rtc.start(receive)
        } else {
            console.error("実行権限がありません")
        }
    }

    async function debug() {
        const osc = streams.ctx.createOscillator();
        const gain = streams.ctx.createGain();
        gain.gain.value = 0.2;
        osc.connect(gain)
        gain.connect(streams.ctx.destination)
        osc.start()
        rtc.keys().forEach(async (key) => { osc.connect(streams.dests[key]) })
        await new Promise(resolve => setTimeout(resolve, 2000))
        rtc.keys().forEach(async (key) => { osc.disconnect(streams.dests[key]) })
        osc.stop()
    }

    function makePlayers() {
        setPlayers(Object.entries(mp.getPersonList()).map(([clientId, rtcId], i) => {
            return (
                <ClientAudio audio={streams.raw[rtcId]}
                    key={i}
                    profile={prs.profile(clientId)} />
            )
        }))
    }

    function receive(e: any, rtcId: string) {
        const res = e.data ? JSON.parse(e.data) : JSON.parse(e);
        const clientId = res.id
        console.log(`[[[receive]]]: ${clientId}`, res)
        switch (res.action) {
            case "alert":
                mp.alert(clientId, res.text, res.reload)
                break;
            case "move":
                mp.move(clientId, res.x, res.y)
                break;
            case "join":
                mp.join(res.profile, clientId, rtcId)
                makePlayers()
                break;
            case "leave":
                mp.leave(clientId)
                rtc.close(rtcId)
                makePlayers()
                break;
            case "audio":
                for (let targetId of res.connect) {
                    streams.medias[prs.rtcId(targetId)].connect(streams.dests[rtcId])
                    console.log("connect!", targetId, `${clientId}(${rtcId})`)
                }
                for (let targetId of res.disconnect) {
                    streams.medias[prs.rtcId(targetId)].disconnect(streams.dests[rtcId])
                    console.log("disconnect!", targetId, `${clientId}(${rtcId})`)
                }
                break;
            case "mute":
                mp.mute(clientId, res.enabled)
                streams.medias[rtcId].mediaStream.getAudioTracks()[0].enabled = !res.enabled
                break;
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
        </div>
    )
}