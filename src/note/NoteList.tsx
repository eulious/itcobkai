import React, { useEffect, useState } from "react";

interface NoteInfo {
    id: string
    title: string
    unread: boolean
}

interface Author {
    name: string
    notes: NoteInfo[]
}

export default function NoteList() {
    const [authors, setAuthors] = useState<Author[]>([])
    const [select, setSelect] = useState("")

    useEffect(() => {
        setAuthors([{
            name: "笠井",
            notes: [
                { id: "1", title: "hoge1", unread: false },
                { id: "3", title: "hoge3", unread: true },
                { id: "2", title: "hoge2", unread: false },
                { id: "4", title: "hoge4", unread: false },
            ]
        }])
    }, [])

    return (
        <div className="note__nav">
            {authors.map((author, i) => {
                author.notes.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
                return (
                    <details open key={i}>
                        <summary>{author.name}</summary>
                        {author.notes.map((note, j) => (
                            <Card key={j}
                                info={note}
                                isSelect={select === note.id}
                                setSelect={setSelect} />
                        ))}
                    </details>
                )
            })}
        </div>
    )
}


interface CardProps {
    info: NoteInfo
    isSelect: boolean
    setSelect: Function
}
function Card(props: CardProps) {
    const [unread, setUnread] = useState(props.info.unread)

    let className = "notes__card "
    if (props.isSelect) {
        className += "notes__card--select"
    } else if (props.info.unread) {
        className += "notes__card--unread"
    } else {
        className += "notes__card--unselect"
    }

    function onClick() {
        props.setSelect(props.info.id)
        setUnread(false)
    }

    return (
        <div className={className}
            onClick={onClick}>
            {props.info.title}</div>
    )
}