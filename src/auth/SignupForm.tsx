import React from "react";
import { request } from "../common/Common";
import { ClubCheckBox, SelectBox, TextArea, TextBox } from "./Component";

interface SignupFormProps {
    setValue: Function
    value: any
}
export default function SignupForm(props: SignupFormProps) {
    const { value, setValue } = props

    const isFilled = Boolean(value.faculty) && Boolean(value.year)
        && (value.member.dtm || value.member.cg || value.member.prog || value.member.mv)

    async function submit() {
        request("POST", "/users/me", "db", {
            profile: value,
        }).then(res => {
            console.log("return", res)
            if (res.status === "ng") {
                console.error(res.detail, false)
            } else {
                console.error("登録完了")
                location.href = location.href.split("?")[0] + "?mode=rtcViewer"
            }
        })
    }

    return (
        <div>
            <div className="auth__form-item"><h3>ログイン名: {props.value.name} </h3></div>
            <TextBox placeholder="学科(英字)" value={value} setValue={setValue} form="faculty" />
            <SelectBox value={value} setValue={setValue} />
            <div className="auth__form-item">
                所属:<br />
                <ClubCheckBox form="dtm" value={value} setValue={setValue} />
                <ClubCheckBox form="cg" value={value} setValue={setValue} />
                <ClubCheckBox form="prog" value={value} setValue={setValue} />
                <ClubCheckBox form="mv" value={value} setValue={setValue} />
            </div>
            <TextArea value={value} setValue={setValue} />
            <img src={props.value.thumbnail ? `https://cdn.discordapp.com/avatars/${props.value.thumbnail}.png` : ""} />
            <div className="auth__button-panel">
                {isFilled
                    ? <div onClick={submit} className="auth__button">Join Server</div>
                    : <div className="auth__button auth__button--disable">Join Server</div>
                }
            </div>
        </div>
    )
}

async function sha256(text: string) {
    const uint8 = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('')
}