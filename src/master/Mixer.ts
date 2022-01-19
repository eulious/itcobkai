import { Streams } from "../rtc/rtc"

// プレイヤーの音声を管理するクラス
export default class Mixer {
    private streams: Streams

    constructor(streams: Streams) {
        this.streams = streams
    }

    public connect(clientId: string, targetId: string, volume: number) {
        if (!this.streams.gains[clientId][targetId]) {
            this.streams.gains[clientId][targetId] = this.streams.ctx.createGain()
        }
        var gain = this.streams.gains[clientId][targetId]
        this.streams.medias[targetId].connect(gain)
        gain.connect(this.streams.dests[clientId])
    }

    public disconnect(clientId: string, targetId: string) {
        var gain = this.streams.gains[clientId][targetId]
        this.streams.medias[targetId].disconnect(gain)
        gain.disconnect(this.streams.dests[clientId])
    }

    public changeDist(res: any, clientId: string) {
        for (let targetId of res.connect) {
            this.streams.medias[targetId].connect(this.streams.dests[clientId])
            console.log("connect!", targetId, clientId)
        }
        for (let targetId of res.disconnect) {
            this.streams.medias[targetId].disconnect(this.streams.dests[clientId])
            console.log("disconnect!", targetId, clientId)
        }
    }
}
