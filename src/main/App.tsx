import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Context, initState, reducer } from "../common/Context";
import React, { useReducer } from "react";
import { ErrorBoundary } from 'react-error-boundary'
import GlobalStyle from '../common/Style';
import Main from "./Main";

// 最上位コンポーネント
// 親コンポーネント: 無し
export default function App() {
    const [state, dispatch] = useReducer(reducer, initState)

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} >
            <Context.Provider value={{ state, dispatch }}>
                <GlobalStyle />
                <BrowserRouter>
                    <Routes>
                        <Route path="*" element={<Main />} />
                    </Routes>
                </BrowserRouter>
            </Context.Provider>
        </ErrorBoundary >
    )
}

// React関連のエラー時にエラーを表示
function ErrorFallback({ error, resetErrorBoundary }: { error: any, resetErrorBoundary: any }) {
    return (
        <div role="alert">
            <p>{error.message}</p>
            <pre style={{ fontSize: "16px" }}>{error.stack}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    )
}

if (localStorage.develop === "true") {
    const ws = new WebSocket("ws://localhost:10005")
    ws.onmessage = m => location.href = location.href.split("&dev=")[0] + "&dev=" + String(new Date().getTime())
}

setInterval(() => console.clear(), 15 * 60 * 1000)