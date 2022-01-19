import React, { useEffect, useMemo, useState } from "react";
import { getParam, useTransition } from "../common/Hooks";
import { Connection } from "../viewer/Connector";
import ReactMarkdown from "react-markdown";
import { Person } from "../viewer/Persons";
import { S3_URL } from "../common/Config";
import PersonInfo from "../common/Person";
import rehypeRaw from "rehype-raw";
import gfm from 'remark-gfm'

interface NoteViewerProps {
    content: string
    player: Person
    conn: Connection
}
export default function NoteViewer(props: NoteViewerProps) {
    const param = getParam()
    const transition = useTransition()
    const canEdit = props.player.id === param.id

    function edit() {
        if (canEdit) {
            transition(`note&id=${param.id}&edit=true`, true, false)
        }
    }

    return (
        <div className="editor__modal">
            <div className="editor__container">
                <header className="editor__header">
                    <div className="header__left">
                        PROFILE
                    </div>
                    <div className="header__right" style={{ display: "flex" }}>
                        <div>
                            <div className="btn-flat" onClick={edit}>編集</div>
                        </div>
                    </div>
                </header>
                <Render
                    className="editor__render"
                    content={props.content} />
                <SideMenu
                    conn={props.conn}
                    player={props.player} />
            </div>
        </div>
    )
}


interface SideMenuProps {
    conn: Connection
    player: Person
}
function SideMenu(props: SideMenuProps) {
    const [connect, setConnect] = useState<Set<string>>(new Set<string>())
    const transition = useTransition()
    const param = getParam()

    function onClick(id: string) {
        transition(`note&id=${id}`, true, false)
    }

    const online = useMemo(() => {
        const online: JSX.Element[] = []
        if (!props.conn) return online
        props.conn.all.forEach((p, i) => {
            if (connect.has(p.id)) return
            online.push(
                <PersonInfo
                    key={i}
                    profile={p.profile}
                    selected={param.id === p.id}
                    onClick={() => onClick(p.id)}
                    muted={false} />
            )
        })
        return online
    }, [props, connect])


    useEffect(() => {
        if (!props.conn) return
        for (let id of props.conn.connect) {
            connect.add(id)
        }
        for (let id of props.conn.disconnect) {
            if (!(connect.has(id))) continue
            connect.delete(id)
            console.log("disconnect", id)
        }
        setConnect(new Set(connect))
    }, [props])

    return (
        <div>{online}</div>
    )
}


// mdをレンダリングして表示
// 親コンポーネント: note.Editor, note.Note
interface RenderProps {
    content: string
    className?: string
}
export function Render(props: RenderProps) {
    const value = useMemo(() => {
        let value = ""
        props.content?.split("\n").forEach((line) => {
            if (line.match(/\ *@import-jpg/)) {
                const d = parse(line.replace(/\ *@import-jpg/, ""))
                value += `<img src="${S3_URL}/note/jpg/${d.id}.jpg" height="${d.height}" width="${d.width}"></img>\n`
            } else if (line.match(/\ *@import-mp3/)) {
                const d = parse(line.replace(/\ *@import-mp3/, ""))
                value += `<audio src="${S3_URL}/note/mp3/${d.id}.mp3" controls preload="none"></audio>\n`
            } else {
                value += line + "\n"
            }
        })
        return value
    }, [props.content])

    function parse(line: string) {
        try {
            return JSON.parse(line.replace(/\ *@import-jpg/, ""))
        } catch {
            return {}
        }
    }

    return (
        <div className={props.className}>
            <div className="markdown-body">
                <ReactMarkdown
                    remarkPlugins={[[gfm, { singleTilde: false }]]}
                    rehypePlugins={[rehypeRaw]}
                    children={value} />
            </div>
        </div>
    )
}