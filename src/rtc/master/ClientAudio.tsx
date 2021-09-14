import React, { useEffect, useRef } from "react";
import { Profile } from "../viewer/Persons";
import PersonInfo from "../viewer/Person";

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