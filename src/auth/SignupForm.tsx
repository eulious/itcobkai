import React from "react";
import { request } from "../common/Common";
import { ClubCheckBox, SelectBox, TextArea, TextBox } from "./Component";
import Discord from "./Discord";

interface SignupFormProps {
    setValue: Function
    value: any
}
export default function SignupForm(props: SignupFormProps) {
    const { value, setValue } = props

    const isFilled = Boolean(value.faculty) && Boolean(value.year)
        && (value.member.dtm || value.member.cg || value.member.prog || value.member.mv)

    async function submit() {
        value.password = await sha256(value.password)
        request("/signup", value).then(res => {
            console.log("return", res)
            if (res.status === "ng") {
                console.error(res.detail, false)
            } else {
                console.error("登録完了")
                localStorage.token = res.token
                location.href = "./index.html"
            }
        })
    }

    return (
        <div>
            <TextBox placeholder="学科(英字)" value={value} setValue={setValue} form={"faculty"} />
            <SelectBox value={value} setValue={setValue} />
            <div className="auth__form-item">
                所属:<br />
                <ClubCheckBox form="dtm" value={value} setValue={setValue} />
                <ClubCheckBox form="cg" value={value} setValue={setValue} />
                <ClubCheckBox form="prog" value={value} setValue={setValue} />
                <ClubCheckBox form="mv" value={value} setValue={setValue} />
            </div>
            <TextArea value={value} setValue={setValue} />
            <div className="auth__button-panel">
                {isFilled
                    ? <div onClick={submit} className="auth__button">Join Server</div>
                    : <div className="auth__button auth__button--unable">Join Server</div>
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