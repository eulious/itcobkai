// プレイヤー全員の音声を格納
export interface Streams {
    ctx: AudioContext
    raw: { [key: string]: HTMLMediaElement }
    dests: { [key: string]: MediaStreamAudioDestinationNode }
    medias: { [key: string]: MediaStreamAudioSourceNode }
    gains: { [key: string]: { [key: string]: GainNode } }
}