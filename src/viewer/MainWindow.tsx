import React, { ChangeEvent, useContext, useEffect, useState } from "react"
import classNames from "classnames"
import request from "../common/Request"
import { Render } from "../note/NoteViewer"
import Editor, { EditorCore } from "../note/Editor"
import classnames from "classnames"
import { Context } from "../common/Context"

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

    const canvasClass = classNames({
        "viewer__canvas_wrapper": true,
        "viewer__canvas_wrapper--disable": !isMap
    })

    function onChange(content: string) {
        setContent(content)
        request("POST", "/notes/contents", { "content": content })
    }

    return (
        <td>
            <div className={canvasClass}>
                <canvas
                    className="viewer__canvas"
                    ref={props.canvasRef}
                    width="512"
                    height="512" />
            </div>
            <Note size={size}
                content={content}
                onChange={onChange}
                canEdit={state.id === props.mode}
                visible={!isMap}
            />
        </td>
    )
}


interface NoteProps {
    size: number
    content: string
    onChange: Function
    canEdit: boolean
    visible: boolean
}
function Note(props: NoteProps) {
    const [isEdit, setIsEdit] = useState(false)

    useEffect(() => {
        setIsEdit(false)
    }, [props.content])

    const portfolioClass = classNames({
        "viewer__portfolio_wrapper": true,
        "viewer__portfolio_wrapper--disable": !props.visible
    })

    function onClick() {
        setIsEdit(true)
    }

    function onChange(content: string) {
        console.log("onchange")
        setIsEdit(false)
        props.onChange(content)
    }

    return (
        <div style={{ width: `${props.size}px`, height: `${props.size}px` }}
            className={portfolioClass}>
            {isEdit ? (
                <Editor content={props.content}
                    onChange={onChange}
                    width={props.size}
                    height={props.size} />
            ) : (
                <Render
                    className="viewer__portfolio"
                    content={props.content} />
            )}
            {(props.canEdit && !isEdit && props.content !== "読み込み中...") && (
                <div style={{ position: "relative", top: `-${props.size}px`, right: `-${props.size - 90}px` }}
                    onClick={onClick}
                    className="btn-flat">編集</div>
            )}
        </div >
    )
}