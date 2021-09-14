import { beep } from "../utils/Common"
import { Streams } from "../utils/Schema"
import startMaster from "./kinesisMaster"
import startViewer from "./kinesisViewer"

export class RTCMaster {
    public KEYS: any
    private master: any

    public keys = () => Object.keys(this.master.dataChannelByClientId)

    public message = (clientId: string, d: any) => {
        this.master.dataChannelByClientId[clientId].send(d.length ? d : JSON.stringify(d));
    }

    public async start(receive: Function): Promise<Streams> {
        const res = await startMaster(this.KEYS, () => { }, receive)
        this.master = res.master
        return res.streams
    }

    public stop() {
        this.master.signalingClient.close();
        this.master.signalingClient = null;
        Object.keys(this.master.peerConnectionByClientId).forEach(clientId => {
            this.master.peerConnectionByClientId[clientId].close();
        });
    }

    public close(clientId: string) {
        this.master.peerConnectionByClientId[clientId].close();
    }
}


export class RTCViewer {
    public KEYS: any
    private viewer: any

    public message = (d: any) => {
        console.log("[[[send]]]", d)
        this.viewer.dataChannel.send(JSON.stringify(d));
    }

    public async start(id: string, localAudio: HTMLAudioElement, remoteAudio: HTMLAudioElement, receive: Function) {
        beep()
        this.viewer = await startViewer(this.KEYS, localAudio, remoteAudio, id, receive)
    }

    public stop() {
        console.log('[VIEWER] Stopping viewer connection');
        this.message({ action: "leave" })
        this.viewer.signalingClient.close();
        this.viewer.peerConnection.close();
        this.viewer.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        this.viewer.remoteStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    public mute(enabled: boolean) {
        this.viewer.localStream.getAudioTracks()[0].enabled = enabled
        this.message({ action: "mute", enabled: enabled })
    }
}