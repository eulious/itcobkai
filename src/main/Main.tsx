import React, { useMemo } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import { getParam } from "../common/Common";
import classNames from "classnames";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Signup from "./Signup";
import Note from "../note/Note";
import "../scss/style.scss"

// 最上位コンポーネント
// 親コンポーネント: main.App
export default function Main() {
    const history = useHistory()
    const loc = useLocation()
    const params = getParam()

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