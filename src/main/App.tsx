import React, { useMemo, useState } from "react";
import Signup from "../auth/Signup";
import { getParam } from "../common/Common";
import Master from "../rtc/master/Master";
import Viewer from "../rtc/viewer/Viewer";
import Main from "./Main";
import "./style.scss"

export default function App() {
    const [a, setA] = useState(0)
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

    function onClick() {
        setA(a + 1)
    }

    return dom
}