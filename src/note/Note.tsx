import React, { useEffect, useState } from "react";
import { Render } from "./Components";
import { request } from "../common/Common";
import NoteList from "./NoteList";
import SideMenu from "./SideMenu";
import Header from "../main/Header";
import Editor from "./Editor";


export interface NoteDetail {
    permission: string[]
    content: string
    info: NoteInfo
}

export interface NoteInfo {
    id: string
    updated_at?: number
    title: string
    unread: boolean
    editable: boolean
}

export default function Note() {
    const [onEdit, setOnEdit] = useState(false)
    const [note, setNote] = useState<NoteInfo>()
    const [detail, setDetail] = useState<NoteDetail>()

    function edit() {
        setOnEdit(true)
    }

    function updateDetail(detail: NoteDetail) {
        setDetail(detail)
        setNote({ ...detail.info })
    }

    useEffect(() => {
        if (!note) return
        console.log(note)
        request("GET", "/notes/contents", { note_id: note.id }).then(setDetail)
    }, [note?.id])

    return (
        <div>
            {onEdit &&
                <Editor
                    setOnEdit={setOnEdit}
                    detail={detail}
                    setDetail={updateDetail} />}
            <Header mode="note">
                <div className="header__right">
                    {/* <div>URL取得</div> */}
                    {note?.editable
                        ? <div className="btn-flat" onClick={edit}> 編集 </div>
                        : <div className="btn-flat--disable"> 編集 </div>
                    }
                </div>
            </Header>
            <div className="note__wrapper">
                <NoteList onEdit={onEdit} note={note} setNote={setNote} />
                <div className="note__container">
                    <Render className="note__article" value={onEdit ? "" : detail?.content} />
                </div>
                <SideMenu detail={detail} />
            </div>
        </div>
    );
}