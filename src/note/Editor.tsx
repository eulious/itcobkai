import React, { useState } from "react";
import { Toggle } from "../main/Header";
import { EditorCore, Render, sample } from "./Components";


interface EditorProps {
    setOnEdit: Function;
}
export default function Editor(props: EditorProps) {
    const [value, setValue] = useState(sample);

    function finish() {
        props.setOnEdit(false)
    }

    return (
        <div className="editor__modal">
            <div className="editor__container">
                <header className="editor__header">
                    <div className="header__left">
                        <div className="header__title"> ITCOBKAI </div>
                    </div>
                    <div className="header__right" style={{ display: "flex" }}>
                        <Toggle mode="確認"
                            modes={["確認", "設定"]}
                            setMode={() => { }}></Toggle>
                        <div>
                            <div className="btn-flat" onClick={finish}> 編集完了 </div>
                        </div>
                    </div>
                </header>
                <EditorCore className="editor__editor" value={value} setValue={setValue} />
                <Render className="editor__render" value={value} />
            </div>
        </div>
    );
}