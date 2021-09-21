import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { EditorCore, Render } from "./Components";
import { NoteSetting } from "./Settings";
import { NoteDetail } from "./Note";
import { Toggle } from "../main/Header";
import { request } from "../common/Common";

// 「編集」を押すと表示される画面
// 親コンポーネント: note.Note
interface EditorProps {
    detail?: NoteDetail
    setDetail: Function
    setOnEdit: Function
}
export default function Editor(props: EditorProps) {
    const [mode, setMode] = useState("確認")
    const [value, setValue] = useState(props.detail ? props.detail.content : "")
    const [title, setTitle] = useState(props.detail ? props.detail.info.title : "")

    function finish() {
        props.setOnEdit(false)
        props.detail!.info.title = title ? title : "名称未設定"
        props.detail!.content = value
        props.setDetail({ ...props.detail! })
        request("POST", "/notes/contents", props.detail)
    }

    function titleChange(e: ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value)
    }

    return (
        <div className="editor__modal">
            <div className="editor__container">
                <header className="editor__header">
                    <div className="header__left">
                        <input
                            type="text"
                            className="editor__title--edit"
                            value={title}
                            onChange={titleChange} />
                    </div>
                    <div className="header__right" style={{ display: "flex" }}>
                        <Toggle
                            mode={mode}
                            modes={["確認", "設定"]}
                            setMode={setMode} />
                        <div>
                            <div className="btn-flat" onClick={finish}>編集完了</div>
                        </div>
                    </div>
                </header>
                <EditorCore value={value} setValue={setValue} />
                {mode == "確認"
                    ? <Render className="editor__render" value={value} />
                    : <NoteSetting
                        detail={props.detail}
                        setDetail={props.setDetail} />
                }
            </div>
        </div>
    );
}


// ノートのタイトルを表示
// 編集可能で更新されたらAPIを叩く
interface TitleProps {
    title: string
    setTitle: Function
}
function Title(props: TitleProps) {
    const [onEdit, setOnEdit] = useState(false)
    const ref = useRef<HTMLInputElement>(null)

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        props.setTitle(e.target.value)
    }

    function keydown(e: KeyboardEvent) {
        if (e.key === "Enter") setOnEdit(false)
    }

    useEffect(() => {
        window.addEventListener("keydown", keydown)
        return () => {
            window.removeEventListener("keydown", keydown)
            if (ref.current == null) props.setTitle(props.title)
        }
    })

    useEffect(() => {
        ref.current?.focus();
        ref.current?.select();
    }, [onEdit])

    return (
        <div>
            {onEdit
                ? <input type="text" ref={ref}
                    className="editor__title--edit"
                    value={props.title}
                    onBlur={() => setOnEdit(false)}
                    onChange={onChange} />
                : <div className="editor__title"
                    onClick={() => setOnEdit(true)}>
                    {props.title}</div>
            }
        </div>
    )
}