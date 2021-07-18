import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Toggle } from "../main/Header";
import { EditorCore, Render, sample } from "./Components";
import { NoteSetting } from "./Settings";

interface Note {
    title: string
    permission: string[]
    value: string
}


interface EditorProps {
    setOnEdit: Function;
}
export default function Editor(props: EditorProps) {
    const [value, setValue] = useState(sample);
    const [mode, setMode] = useState("確認")
    const [title, setTitle] = useState("名称未設定")

    function finish() {
        props.setOnEdit(false)
    }

    return (
        <div className="editor__modal">
            <div className="editor__container">
                <header className="editor__header">
                    <div className="header__left">
                        <Title title={title} setTitle={setTitle} />
                    </div>
                    <div className="header__right" style={{ display: "flex" }}>
                        <Toggle mode={mode}
                            modes={["確認", "設定"]}
                            setMode={setMode}></Toggle>
                        <div>
                            <div className="btn-flat" onClick={finish}>編集完了</div>
                        </div>
                    </div>
                </header>
                <EditorCore value={value} setValue={setValue} />
                {mode == "確認"
                    ? <Render className="editor__render" value={value} />
                    : <NoteSetting />
                }
            </div>
        </div>
    );
}


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
    })

    return (
        <div>
            {onEdit
                ? <input type="text" ref={ref}
                    className="header__title--edit"
                    value={props.title}
                    onBlur={() => setOnEdit(false)}
                    onChange={onChange} />
                : <div className="header__title"
                    onClick={() => setOnEdit(true)}>
                    {props.title}</div>
            }
        </div>
    )
}