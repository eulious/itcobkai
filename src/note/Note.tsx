import React, { useState } from "react";
import Header from "../main/Header";
import { EditorCore, Render, sample } from "./Components";

export default function Note() {
    return (
        <div>
            <Header mode="note">
                <div className="right">
                    <div className="btn-flat"> 編集 </div>
                </div>
            </Header>
            <div className="wrapper">
                <div className="nav">
                    <details open>
                        <summary>折りたたみ</summary>
                        <div>内容</div>
                        <div>内容</div>
                        <div>内容</div>
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