import classNames from 'classnames';
import React, { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox } from '../common/BaseComponents';
import { Context } from '../common/Context';
import PersonInfo from '../common/Person';
import request from '../common/Request';
import Header from '../main/Header';
import { Connection } from '../viewer/Connector';
import { Person } from '../viewer/Persons';
import Editor from './Editor';
import { Render } from './NoteViewer';

export default function Note() {
    const { state } = useContext(Context)
    const [content, setContent] = useState("")
    const [isEdit, setIsEdit] = useState(false)
    const [user, setUser] = useState("")
    const width = 600
    const height = 600

    function onClick() {
        setIsEdit(true)
    }

    function onChange(content: string) {
        setIsEdit(false)
        request("POST", "/notes/contents", { "content": content })
        setContent(content)
    }

    return (
        <div>
            <Header mode="note" />
            <div className="note__content">
                {isEdit ? (
                    <Editor content={content}
                        onChange={onChange}
                        width={width}
                        height={height} />
                ) : (
                    <Render
                        className="viewer__portfolio"
                        content={content} />
                )}
                {(state.id === user && !isEdit) && (
                    <div style={{ position: "relative", top: `-${height}px`, right: `-${width - 90}px` }}
                        onClick={onClick}
                        className="btn-flat">編集</div>
                )}
            </div >
            <NoteList
                user={user}
                setUser={setUser} />
        </div>
    )
}


interface NoteListProps {
    user: string
    setUser: Function
}
function NoteList(props: NoteListProps) {
    const { state } = useContext(Context)
    const [users, setUsers] = useState<string[]>([])
    const [dateOrders, setDateOrders] = useState<string[]>([])
    const [order, setOrder] = useState("")
    const [asc, setAsc] = useState(false)

    useEffect(() => {
        request("GET", "/notes").then(res => {
            setUsers(res.notes)
            setDateOrders(res.notes)
            sort()
        })
    }, [])

    useEffect(sort, [asc, order])

    function sort() {
        if (order === "year") {
            const arr = [...users]
            arr.sort((a, b) => state.profiles[a].year - state.profiles[b].year)
            if (asc) setUsers(arr)
            else setUsers(arr.reverse())
        } else if (order === "latest") {
            if (asc) setUsers([...dateOrders])
            else setUsers([...dateOrders].reverse())
        }
    }

    function onClick(user: string) {
        props.setUser(user)
    }

    const dom = useMemo(() => users.map((user, i) => {
        return (
            <PersonInfo
                key={i}
                profile={state.profiles[user]}
                selected={user === props.user}
                onClick={() => onClick(user)} />
        )
    }), [users])

    function onSelect(e: ChangeEvent<HTMLSelectElement>) {
        setOrder(e.target.value)
    }

    return (
        <div>
            <div>
                <select value={order} onChange={onSelect}>
                    <option value="latest">更新日</option>
                    <option value="year">学年</option>
                </select>
                <Checkbox
                    label="昇順"
                    onChange={setAsc} />
            </div>
            <div>
                {dom}
            </div>
        </div>
    )
}