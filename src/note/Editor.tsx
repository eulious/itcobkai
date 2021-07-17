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
        <div className="modal">
            <div className="container">
                <header className="editor__header">
                    <div className="left">
                        <div className="title"> ITCOBKAI </div>
                    </div>
                    <div className="right" style={{ display: "flex" }}>
                        <Toggle mode="確認"
                            modes={["確認", "設定"]}
                            setMode={() => { }}></Toggle>
                        <div>
                            <div className="btn-flat" onClick={finish}> 編集完了 </div>
                        </div>
                    </div>
                </header>
                <EditorCore className="editor" value={value} setValue={setValue} />
                <Render className="render" value={value} />
            </div>
        </div>
    );
}