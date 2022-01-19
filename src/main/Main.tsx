import React, { useContext, useEffect, useMemo } from "react";
import { getParam, useTransition } from "../common/Hooks";
import request, { init } from "../common/Request";
import { Context } from "../common/Context";
import Master from "../master/Master";
import Viewer from "../viewer/Viewer";
import Signup from "./Signup";
import Note from "../note/Note";
import Wait from "./Wait";
import "../scss/style.scss"

// 最上位コンポーネント
// 親コンポーネント: main.App
export default function Main() {
    const { dispatch } = useContext(Context)
    const transition = useTransition()
    const params = getParam()

    useEffect(() => {
        if (params.mode === "auth") return
        init().then(() => {
            request("GET", "/init").then(res => {
                dispatch({ type: "INIT", init: res })
            })
        })
    }, [])

    useEffect(() => {
        if (params.mode !== "panic" && sessionStorage.panic) {
            transition("panic", true, false)
        }
    }, [params])

    const dom = useMemo(() => {
        switch (params.mode) {
            case "rtc":
                return <Viewer />
            case "master":
                return <Master />
            case "auth":
                return <Signup />
            case "panic":
                return <Wait />
            case "note":
                return <Note />
            default:
                transition("rtc", true, false)
        }
    }, [params])

    return (<>{dom}</>)
}