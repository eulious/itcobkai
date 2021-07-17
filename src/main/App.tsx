import React, { useMemo, useReducer, useState } from "react";
import Signup from "./Signup";
import { getParam } from "../common/Common";
import { Context, initState, reducer } from "../common/Context";
import Note from "../note/Note";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import "../scss/style.scss"
import Editor from "../note/Editor";
import { ErrorBoundary } from 'react-error-boundary'

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
            default:
                return <Viewer />
        }
    }, [location.search])


    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} >
            <Context.Provider value={{ state, dispatch }}>
                <div className="body">
                    {dom}
                </div>
            </Context.Provider>
        </ErrorBoundary >
    )
}


function ErrorFallback({ error, resetErrorBoundary }: { error: any, resetErrorBoundary: any }) {
    return (
        <div role="alert">
            <p>{error.message}</p>
            <pre style={{ fontSize: "16px" }}>{error.stack}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    )
}