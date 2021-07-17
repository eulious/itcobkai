import React, { useState } from "react";
import Header from "../main/Header";
import { Render, sample } from "./Components";
import Editor from "./Editor";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ja"

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('ja');

export default function Note() {
    const [onEdit, setOnEdit] = useState(false)

    function edit() {
        setOnEdit(true)
    }

    return (
        <div>
            {onEdit && <Editor setOnEdit={setOnEdit} />}
            <Header mode="note">
                <div className="right">
                    <div className="btn-flat" onClick={edit}> 編集 </div>
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
                    <div>更新日</div>
                    <span>{dayjs().tz("Asia/Tokyo").format('YYYY/MM/DD, ')}</span>
                    <span>{dayjs().tz("Asia/Tokyo").format('HH:mm')}</span>
                    <br />
                    <br />
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