import React, { useEffect, useState } from "react";
import { request } from "../common/Common";
import { ClubCheckBox, SelectBox, TextArea, TextBox } from "./Component";
import ImgBox from "./ImgBox";
import "./style.scss"

export default function Signun() {
    const [value, setValue] = useState<any>({})

    async function submit() {
        const isFilled = Boolean(value.name)
            && Boolean(value.password)
            && Boolean(value.faculty)
            && Boolean(value.year)
            && (value.member.dtm || value.member.cg ||
                value.member.prog || value.member.mv)
        if (!isFilled) {
            console.error("項目が埋まっていません", false);
            return;
        }
        value.password = await sha256(value.password)
        request("POST", "/signup", value).then(res => {
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

    useEffect(() => {
        if (!localStorage.token) return;
        console.log("ユーザー情報取得中...")
        request("GET", `/users?id=${localStorage.token.substring(0, 8)}`).then(res => {
            if (!res.name) return;
            setValue(res)
            console.log(`ユーザー情報取得: ${res.name}`)
        })
    }, [])

    return (
        <div>
            <div className="auth__form-wrapper">
                <h1 className="auth__h1">ITCOBKAI</h1>
                <TextBox placeholder="ハンドルネーム" maxLength={10} value={value} setValue={setValue} form={"name"} />
                <TextBox placeholder="パスワード" value={value} setValue={setValue} form={"password"} />
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
                <ImgBox value={value} setValue={setValue} />
                <div className="auth__button-panel">
                    <input type="submit" onClick={submit} className="auth__button" title="Sign In" value="Join Server"></input>
                </div>
                <div className="auth__form-footer">
                    <p>制作: 笠井@eulious</p>
                </div>
            </div>
        </div>
    )
}

async function sha256(text: string) {
    const uint8 = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('')
}