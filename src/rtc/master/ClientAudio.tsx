import React, { useEffect, useRef } from "react";

interface ClientAudioProps {
    clientId: string
    audio: HTMLAudioElement
}
export default function ClientAudio(props: ClientAudioProps) {
    const ref = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        ref.current!.srcObject = props.audio.srcObject
    }, [props])

    return (
        <div>
            {props.clientId}
            <audio ref={ref} muted autoPlay playsInline controls></audio>
        </div>
    )
}