import React, { useContext, useEffect, useState } from "react";
import Note, { NoteInfo } from "./Note";
import { request } from "../common/Common";
import { Context } from "../common/Context";
import { Author } from "./NoteList";

// ノート画面の左側の作者とタイトルのリスト
// 親コンポーネント: note.Note
interface DetailsProps {
    author: Author
    selected?: NoteInfo
    setNote: Function
}
export default function Details(props: DetailsProps) {
    const notes = props.author.notes.sort((a, b) => a.title.localeCompare(b.title, 'ja'))

    async function onClick() {
        const note = await request("GET", "/notes/portfolio", { name: props.author.name })
        props.setNote(note)
    }

    return (
        <details open className="note__details">
            <summary onClick={onClick}>{props.author.name}</summary>
            {notes.map((note, j) => (
                <Card key={j}
                    note={props.selected?.id === note.id ? props.selected : note}
                    isSelect={props.selected?.id === note.id}
                    setNote={props.setNote} />
            ))}
        </details>
    )
}


// ノート名
interface CardProps {
    note: NoteInfo
    isSelect: boolean
    setNote: Function
}
function Card(props: CardProps) {
    const [unread, setUnread] = useState(props.note.unread)

    let className = "note__card "
    if (props.isSelect) {
        className += "note__card--select"
    } else if (props.note.unread) {
        className += "note__card--unread"
    } else {
        className += "note__card--unselect"
    }

    function onClick() {
        props.setNote(props.note)
        setUnread(false)
    }

    return (
        <div className={className}
            onClick={onClick}>
            {props.note.title}</div>
    )
}