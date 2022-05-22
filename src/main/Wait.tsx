/** @jsx jsx */
import { jsx } from '@emotion/react'
import React, { useEffect, useRef, useState } from "react"
import { getParam, useTransition } from "../common/Hooks"
import request from "../common/Request";
import Header from "./Header"
import { authStyle } from "./Signup";

// Discord連携を促す画面
// 親コンポーネント: main.Main
export default function Wait() {
    const transition = useTransition()
    const [count, setCount] = useState(10)

    useEffect(() => {
        if (sessionStorage.panic) {
            setInterval(() => {
                setCount(count => count - 1)
            }, 1000)
        }
    }, [])

    useEffect(() => {
        if (count < 1) {
            sessionStorage.removeItem("panic")
        }
        if (!sessionStorage.panic) {
            transition("rtc", true, false)
        }
    })

    return (
        <div>
            <Header />
            <div css={authStyle.formWrapper}>
                <h1 css={authStyle.h1}>復旧中...</h1>
                <div>
                    <div>
                        障害が発生したため、
                    </div>
                    <div>
                        システムを再起動しています。
                    </div>
                    <div>
                        {count}秒後にメイン画面に遷移します。
                    </div>
                </div>
                <br />
                <br />
            </div>
        </div>
    )
}