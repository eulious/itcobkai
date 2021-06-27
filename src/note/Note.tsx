import React, { useState } from "react";
import { EditorCore, Render, sample } from "./Components";

export default function Note() {
    return (
        <div>
            <header className="header">
                <div className="left">
                    <div className="title"> ITCOBKAI </div>
                    <div className="toggle">KAI</div>
                </div>
                <div className="right">
                    <div className="btn-flat"> 編集 </div>
                </div>
            </header>
            <div className="wrapper">
                <div className="nav">
                    <details open>
                        <summary>ここをクリックすれば折りたためます</summary>
                        <div>折りたたむ内容</div>
                        <div>折りたたむ内容</div>
                        <div>折りたたむ内容</div>
                    </details>
                </div>
                <div className="container2">
                    <Render className="article" value={sample} />
                </div>
                <div className="side">
                    <div>閲覧可能</div>
                    <br />
                    <br />
                    <div>編集可能</div>
                    <br />
                    <br />
                    <div>ここに目次</div>
                </div>
            </div>
        </div>
    );
}