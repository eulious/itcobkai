import React, { useContext, useEffect, useState } from "react";
import { request } from "../common/Common";
import { Context } from "../common/Context";
import Note, { NoteInfo } from "./Note";

interface Author {
    name: string
    notes: NoteInfo[]
}


interface NoteListProps {
    note?: NoteInfo
    setNote: Function
    onEdit: boolean
}
export default function NoteList(props: NoteListProps) {
    const [authors, setAuthors] = useState<Author[]>([])
    const [myName, setMyName] = useState("")
    const [loading, setLoading] = useState(false)
    const { dispatch } = useContext(Context)


    useEffect(() => {
        setLoading(true)
        request("GET", "/notes/init").then(res => {
            setMyName(res.name)
            setAuthors(res.authors)
            dispatch({ type: "ROLES", roles: res.roles[0] })
            setLoading(false)
        })
    }, [])


    useEffect(() => {
        let flag = false
        authors.forEach(author => {
            author.notes.map(note => {
                if (note.id === props.note?.id && note.title !== props.note?.title) {
                    note.title = props.note?.title
                    flag = true
                }
                return note
            })
        })
        if (flag) setAuthors([...authors])
    }, [props.note?.title])


    async function add() {
        setLoading(true)
        const res = await request("GET", "/notes/add")
        const new_note = { id: res.note_id, title: "名称未設定", unread: false, editable: true }
        authors.forEach(author => {
            if (author.name === myName) {
                author.notes.push(new_note)
            }
        })
        setAuthors([...authors])
        props.setNote(new_note)
        setLoading(false)
    }


    async function remove() {
        if (!props.note) return
        const message = `${props.note.title}を削除しますか？\nこの操作は取り消すことができません。`
        if (!window.confirm(message)) return
        setLoading(true)
        await request("GET", "/notes/remove", { note_id: props.note!.id })
        setAuthors(authors.map(author => {
            return {
                name: author.name,
                notes: author.notes.filter(obj => obj.id !== props.note!.id)
            }
        }))
        props.setNote()
        setLoading(false)
    }


    return (
        <div className="note__nav">
            {!props.onEdit && (
                <AbsoluteButton
                    add={add}
                    remove={remove}
                    canDelete={true} />
            )}
            {loading && <div>読み込み中</div>}
            {!loading && authors.map((author, i) => {
                author.notes.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
                return (
                    <details open key={i} className="note__details">
                        <summary>{author.name}</summary>
                        {author.notes.map((note, j) => (
                            <Card key={j}
                                note={props.note?.id === note.id ? props.note : note}
                                isSelect={props.note?.id === note.id}
                                setNote={props.setNote} />
                        ))}
                    </details>
                )
            })}
        </div>
    )
}


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


interface AbsoluteButtonProps {
    canDelete: boolean
    add: () => void
    remove: () => void
}
function AbsoluteButton(props: AbsoluteButtonProps) {
    return (
        <table className="note__absolute">
            <tbody>
                <tr>
                    <td className="note__absolute_button" onClick={props.remove}>削除</td>
                    <td className="note__absolute_button" onClick={props.add}>新規</td>
                </tr>
            </tbody>
        </table>
    )
}