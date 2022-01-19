import { Profile } from "../viewer/Persons";

// プレイヤーの情報を管理するクラス
export class RTCPersons {
    private rtcIds: { [key: string]: string } = {}
    private profiles: { [key: string]: Profile } = {};
    public mutes: Set<string> = new Set();

    public set(profiles: { [key: string]: Profile }) {
        this.profiles = profiles
    }

    public join(profile: Profile, clientId: string, rtcId: string) {
        this.rtcIds[clientId] = rtcId
        this.profiles[clientId] = profile
    }

    public mute(clientId: string, enable: boolean) {
        if (enable) this.mutes.add(this.rtcId(clientId))
        else this.mutes.delete(this.rtcId(clientId))
    }

    public rtcId(clientId: string): string {
        return this.rtcIds[clientId]
    }

    public profile(clientId: string): Profile {
        return this.profiles[clientId]
    }
}