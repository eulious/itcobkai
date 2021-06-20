import React, { useMemo, useReducer, useState } from "react";
import Signup from "../auth/Signup";
import { getParam } from "../common/Common";
import { Context, initState, reducer } from "../common/Context";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Main from "./Main";
import "./style.scss"

export default function App() {
    const [state, dispatch] = useReducer(reducer, initState)
    const params = getParam()

    const dom = useMemo(() => {
        switch (params.mode) {
            case "rtcViewer":
                return <Viewer />
            case "rtcMaster":
                return <Master />
            case "auth":
                return <Signup />
            default:
                return (<Main />)
        }
    }, [location.search])

    return (
        <Context.Provider value={{ state, dispatch }}>
            {dom}
        </Context.Provider>
    )
}