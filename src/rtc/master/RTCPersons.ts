import { request } from "../../common/Common";
import { Profile } from "../viewer/Persons";

export class RTCPersons {
    private rtcIds: { [key: string]: string } = {}
    private profiles: { [key: string]: Profile } = {};
    public mutes: Set<string> = new Set();

    public set(profiles: { [key: string]: Profile }) {
        this.profiles = profiles
    }

    public async join(clientId: string, rtcId: string): Promise<Profile> {
        this.rtcIds[clientId] = rtcId
        if (this.profiles[clientId]) {
            return this.profiles[clientId]
        } else {
            const profile = await request("GET", "/user", { id: clientId }).then(res => res[0])
            this.profiles[clientId] = profile
            return profile
        }
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