import React, { useContext, useEffect, useMemo } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import { getParam, request } from "../common/Common";
import { Context } from "../common/Context";
import classNames from "classnames";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Signup from "./Signup";
import dayjs from "dayjs";
import Note from "../note/Note";
import "../scss/style.scss"

// 最上位コンポーネント
// 親コンポーネント: main.App
export default function Main() {
    const { dispatch } = useContext(Context)
    const history = useHistory()
    const params = getParam()
    const loc = useLocation()

    useEffect(() => {
        sessionStorage.disable = dayjs().add(1, "minutes")
        request("GET", "/init").then(res => {
            dispatch({ type: "INIT", init: res })
            sessionStorage.disable = 0
        })
    }, [])

    const makeClass = (mode?: string) => classNames({
        "main__component": true,
        "main__component--active": params.mode === mode
    })

    const dom = useMemo(() => {
        switch (params.mode) {
            case undefined:
                history.replace(`${location.pathname}?mode=rtc`)
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