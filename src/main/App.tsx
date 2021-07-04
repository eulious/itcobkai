import React, { useMemo, useReducer, useState } from "react";
import Signup from "./Signup";
import { getParam } from "../common/Common";
import { Context, initState, reducer } from "../common/Context";
import Note from "../note/Note";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Main from "./Main";
import "../scss/style.scss"
import Editor from "../note/Editor";

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
            case "note":
                return <Note />
            case "edit":
                return <Editor />
            default:
                return (<Main />)
        }
    }, [location.search])

    return (
        <Context.Provider value={{ state, dispatch }}>
            <div className="body">
                {dom}
            </div>
        </Context.Provider>
    )
}