import React, { useEffect, useRef } from "react";
import { Profile } from "../viewer/Persons";
import PersonInfo from "../common/Person";

// Master画面のプロフィール欄
// 親コンポーネント: rtc.master.Master
interface ClientAudioProps {
    profile: Profile
    audio: HTMLAudioElement
}
export default function ClientAudio(props: ClientAudioProps) {
    const ref = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        ref.current!.srcObject = props.audio.srcObject
    }, [props])

    return (
        <div style={{ display: "flex" }}>
            <PersonInfo profile={props.profile} />
            <audio ref={ref} muted autoPlay playsInline controls></audio>
        </div>
    )
}