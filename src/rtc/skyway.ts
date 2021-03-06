import Peer, { DataConnection, MediaConnection } from "skyway-js";
import { beep, id62 } from "../common/Common";
import { Profile } from "../viewer/Persons";
import { Streams } from "./rtc";

export class RTCMaster {
    public KEYS: any
    private peer: Peer | undefined
    private mediaConnections: { [key: string]: MediaConnection } = {}
    private dataConnections: { [key: string]: DataConnection } = {}
    private streams: Streams
    private osc: GainNode

    constructor() {
        this.streams = {
            ctx: new (window.AudioContext || (window as any).webkitAudioContext),
            medias: {},
            dests: {},
            gains: {},
            raw: {}
        }
        this.osc = this.dummyNoise(this.streams.ctx)
    }

    public keys = () => Object.keys(this.dataConnections)

    public message = (rtcId: string, d: any) => {
        console.log(`[[[send]]]: ${d.id}`, d)
        this.dataConnections[rtcId].send(d.length ? d : JSON.stringify(d));
    }

    public async start(receive: Function): Promise<Streams> {
        this.peer = new Peer("master", {
            key: this.KEYS.SKYWAY,
            debug: 3,
        });
        this.peer.on('error', console.error);

        this.peer.on('call', (mediaConnection: MediaConnection) => {
            const id = mediaConnection.remoteId
            if (this.keys().indexOf(id) >= 0) return;
            console.log("[[[id]]]", id)
            this.mediaConnections[id] = mediaConnection

            this.streams.dests[id] = this.streams.ctx.createMediaStreamDestination()
            this.osc.connect(this.streams.dests[id])
            // const [track] = this.streams.dests[id].stream.getAudioTracks();
            mediaConnection.answer(this.streams.dests[id].stream);

            mediaConnection.on('stream', async (stream: MediaStream) => {
                this.streams.gains[id] = {}
                this.streams.medias[id] = this.streams.ctx.createMediaStreamSource(stream);
                this.streams.raw[id] = document.createElement("audio")
                this.streams.raw[id].srcObject = stream;
                this.streams.raw[id].muted = true;
                this.streams.raw[id].controls = true;
                this.streams.raw[id].autoplay = true;
            });
            mediaConnection.once('close', () => {
                // ????????????
            });
        });

        this.peer.on('connection', (dataConnection: DataConnection) => {
            const id = dataConnection.remoteId
            this.dataConnections[id] = dataConnection
            dataConnection.on('data', (data: any) => receive(data, id));
            dataConnection.once('close', () => {
                // ????????????
            });
        });

        return this.streams
    }

    public close(clientId: string) {
        this.dataConnections[clientId].close(true)
        this.mediaConnections[clientId].close(true);
    }

    public stop() {
        console.log("stop")
        this.keys().forEach(clientId => {
            this.dataConnections[clientId].close(true)
            this.mediaConnections[clientId].close(true);
        });
    }

    private dummyNoise(ctx: AudioContext): GainNode {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        // gain.gain.value = 0.01;
        osc.connect(gain)
        osc.start()
        return gain
    }
}


export class RTCViewer {
    public KEYS: any
    private peer?: Peer
    private localStream?: MediaStream
    private mediaConnection?: MediaConnection
    private dataConnection?: DataConnection
    private id?: string

    public message = (d: any) => {
        console.log("[[[send]]]", d)
        d.id = this.id;
        this.dataConnection!.send(JSON.stringify(d));
    }

    // public async start(id: string, localView: HTMLAudioElement, remoteView: HTMLAudioElement, receive: Function) {
    public async start(profile: Profile, id: string, localView: HTMLAudioElement, remoteView: HTMLAudioElement, receive: Function) {
        beep()
        this.id = id
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localView.srcObject = this.localStream;
        this.peer = new Peer(id62(), {
            key: this.KEYS.SKYWAY,
            debug: 3,
        });

        this.peer.once('open', (iii: string) => {
            this.mediaConnection = this.peer!.call("master", this.localStream);
            this.mediaConnection.on('stream', async (stream: MediaStream) => {
                remoteView.srcObject = stream;
            });
            this.mediaConnection.once('close', () => {
                (remoteView.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                remoteView.srcObject = null;
            });
            this.dataConnection = this.peer!.connect("master");
            this.dataConnection.on('data', receive);
            this.dataConnection.once('open', () => {
                // this.dataConnection!.send(JSON.stringify({ action: "join", id: id }))
                this.dataConnection!.send(JSON.stringify({ action: "join", profile: profile, id: id }))
            });
            this.dataConnection.once('close', () => {
                // ?????????????????????
            });
        });
    }

    public async stop() {
        this.message({ action: "leave" })
        // this.mediaConnection!.close(true);
        // this.dataConnection!.close(true);
        // this.localStream!.getTracks().forEach(track => track.stop());
        // this.remoteStream.getTracks().forEach(track => track.stop());
    }

}