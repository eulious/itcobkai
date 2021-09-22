import React, { useReducer } from "react";
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { Context, initState, reducer } from "../common/Context";
import { ErrorBoundary } from 'react-error-boundary'
import Main from "./Main";
import "../scss/style.scss"

// 最上位コンポーネント
// 親コンポーネント: 無し
export default function App() {
    const [state, dispatch] = useReducer(reducer, initState)

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} >
            <Context.Provider value={{ state, dispatch }}>
                <BrowserRouter>
                    <Switch>
                        <Route>
                            <Main />
                        </Route>
                    </Switch>
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

setInterval(() => console.clear(), 15 * 60 * 1000)