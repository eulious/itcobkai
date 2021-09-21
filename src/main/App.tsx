import React, { useMemo, useReducer } from "react";
import { Context, initState, reducer } from "../common/Context";
import { ErrorBoundary } from 'react-error-boundary'
import { getParam } from "../common/Common";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Signup from "./Signup";
import Note from "../note/Note";
import "../scss/style.scss"


export default function App() {
    const [state, dispatch] = useReducer(reducer, initState)
    const params = getParam()

    const dom = useMemo(() => {
        switch (params.mode) {
            case "rtc":
                return <Viewer />
            case "master":
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
                {dom}
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

setInterval(() => console.clear(), 15 * 60 * 1000)