import React, { useState } from "react";
import { EditorCore, Render, sample } from "./Components";

export default function Editor() {
    const [value, setValue] = useState(sample);
    return (
        <div>
            <header className="header">
                <div className="left">
                    <div className="title"> ITCOBKAI </div>
                </div>
                <div className="right">
                    <div className="btn-flat"> 編集完了 </div>
                </div>
            </header>
            <div className="container">
                <EditorCore className="editor" value={value} setValue={setValue} />
                <Render className="render" value={value} />
            </div>
        </div>
    );
}