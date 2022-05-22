import React, { useContext, useEffect, useMemo } from "react";
import { getParam, useTransition } from "../common/Hooks";
import request, { init } from "../common/Request";
import { Context } from "../common/Context";
import Master from "../master/Master";
import Viewer from "../viewer/Viewer";
import Signup from "./Signup";
import Wait from "./Wait";

// 最上位コンポーネント
// 親コンポーネント: main.App
export default function Main() {
    const { state, dispatch } = useContext(Context)
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
                return state.id ? (<Viewer />) : (<div />)
            case "master":
                return <Master />
            case "auth":
                return <Signup />
            case "panic":
                return <Wait />
            default:
                transition("rtc", true, false)
        }
    }, [params, state])

    return (<>{dom}</>)
}