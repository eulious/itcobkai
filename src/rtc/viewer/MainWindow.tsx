import React, { useEffect, useRef, useState } from "react"
import { request } from "../../common/Common"
import { Render } from "../../note/Components"
import classNames from "classnames"

interface MainWindowProps {
    canvasRef: React.RefObject<HTMLCanvasElement>
    mode: string
}
export default function MainWindow(props: MainWindowProps) {
    const isMap = props.mode === "normal" || props.mode === "overall"
    const [value, setValue] = useState("")
    const [user, setUser] = useState("")
    const maxWidth = window.innerWidth - 400;
    const maxHeight = window.innerHeight - 190;
    const size = Math.min(maxHeight, maxWidth)

    useEffect(() => {
        if (isMap || !props.mode) return
        if (user !== props.mode) setUser(props.mode)
    }, [props.mode])

    useEffect(() => {
        console.log(0, user)
        if (user === "") return
        request("GET", "/notes/contents", { "note_id": props.mode }).then(res => {
            console.log(1, res)
            setValue(res.content)
        })
    }, [user])

    const canvasClass = classNames({
        "viewer__canvas_wrapper": true,
        "viewer__canvas_wrapper--disable": !isMap
    })

    const portfolioClass = classNames({
        "viewer__portfolio_wrapper": true,
        "viewer__portfolio_wrapper--disable": isMap
    })

    return (
        <td>
            <div className={canvasClass}>
                <canvas
                    className="viewer__canvas"
                    ref={props.canvasRef}
                    width="512"
                    height="512" />
            </div>
            <div style={{ width: `${size}px`, height: `${size}px` }}
                className={portfolioClass}>
                <Render
                    className="viewer__portfolio"
                    value={value} />
            </div>
        </td>
    )
}