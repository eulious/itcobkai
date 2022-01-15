import React, { useContext, useEffect, useMemo } from "react";
import { getParam, useTransition } from "../common/Hooks";
import { request } from "../common/Common";
import { Context } from "../common/Context";
import classNames from "classnames";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Signup from "./Signup";
import Note from "../note/Note";
import "../scss/style.scss"

// 最上位コンポーネント
// 親コンポーネント: main.App
export default function Main() {
    const { dispatch } = useContext(Context)
    const transition = useTransition()
    const params = getParam()

    useEffect(() => {
        if (params.mode === "auth") return
        request("GET", "/init").then(res => {
            dispatch({ type: "INIT", init: res })
        })
    }, [])

    const makeClass = (mode?: string) => classNames({
        "main__component": true,
        "main__component--active": params.mode === mode
    })

    const dom = useMemo(() => {
        console.log("hook!")
        switch (params.mode) {
            case undefined:
                transition("rtc", true, true)
            case "master":
                return <Master />
            case "auth":
                return <Signup />
            default:
                return (<>
                    <div className={makeClass("rtc")}>
                        <Viewer />
                    </div>
                    <div className={makeClass("note")}>
                        <Note />
                    </div>
                </>)
        }
    }, [params])

    return (<>{dom}</>)
}