/** @jsx jsx */
import React, { useContext, useEffect, useState } from "react"
import request from "../common/Request"
import { Context } from "../common/Context"
import { css, jsx } from '@emotion/react'
import Slide from "./Slide"

interface MainWindowProps {
    canvasRef: React.RefObject<HTMLCanvasElement>
    mode: string
}
export default function MainWindow(props: MainWindowProps) {
    const { state } = useContext(Context)
    const isMap = props.mode === "normal" || props.mode === "overall"
    const [content, setContent] = useState("")
    const [user, setUser] = useState("")
    const maxWidth = window.innerWidth - 400;
    const maxHeight = window.innerHeight - 190;
    const size = Math.min(maxHeight, maxWidth)

    useEffect(() => {
        if (isMap || !props.mode) return
        if (user !== props.mode) setUser(props.mode)
    }, [props.mode])

    useEffect(() => {
        if (user === "") return
        setContent("読み込み中...")
        request("GET", "/notes/contents", { "id": props.mode }).then(res => {
            setContent(res.content)
        })
    }, [user])

    function onChange(content: string) {
        setContent(content)
        request("POST", "/notes/contents", { "content": content })
    }

    return (
        <td>
            <div css={[style.wrapper, !isMap && style.disable]}>
                <canvas
                    data-id="map"
                    css={style.canvas}
                    ref={props.canvasRef}
                    width="512"
                    height="512" />
            </div>
            <Slide size={size}
                content={content}
                onChange={onChange}
                canEdit={state.id === props.mode}
                visible={!isMap}
            />
        </td>
    )
}


const style = {
    canvas: css({
        "-webkit-user-select": "none",
        userSelect: "none"
    }),

    wrapper: css({
        "-webkit-user-select": "none",
        userSelect: "none",
        padding: "5px 20px"
    }),

    disable: css({
        display: "none"
    })
}