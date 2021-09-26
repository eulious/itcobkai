import React, { useEffect, useMemo, useRef, useState } from "react"
import PersonInfo from "../../common/Person"
import { Connection } from "./Connector"
import classnames from "classnames"
import { Person } from "./Persons"

// サイドメニュー
// 親コンポーネント: rtc.viewer.Viewer
interface SideMenuProps {
    conn?: Connection
    player?: Person
    mutes: Set<string>
    mode: string
    setMode: Function
}
export default function SideMenu(props: SideMenuProps) {
    const [connect, setConnect] = useState<Set<string>>(new Set<string>())
    const [select, setSelect] = useState("")
    const ref = useRef<HTMLDivElement>(null)

    function onClick(mode: string) {
        props.setMode(mode)
        if (mode !== "normal" && mode !== "overall") {
            setSelect(mode)
        }
    }

    const talking = useMemo(() => {
        const talking: JSX.Element[] = []
        if (props.player) {
            talking.push(
                <PersonInfo
                    key={-1}
                    profile={props.player.profile}
                    selected={select === props.player.id}
                    onClick={() => onClick(props.player!.id)}
                    muted={props.mutes.has(props.player.id)} />
            )
        }
        if (!props.conn) return talking
        props.conn.all.forEach((p, i) => {
            if (!(connect.has(p.id))) return
            talking.push(
                <PersonInfo
                    key={i}
                    profile={p.profile}
                    selected={select === p.id}
                    onClick={() => onClick(p.id)}
                    muted={props.mutes.has(p.id)} />
            )
        })
        return talking
    }, [props, connect, props.mutes])

    const online = useMemo(() => {
        const online: JSX.Element[] = []
        if (!props.conn) return online
        props.conn.all.forEach((p, i) => {
            if (connect.has(p.id)) return
            online.push(
                <PersonInfo
                    key={i}
                    profile={p.profile}
                    selected={select === p.id}
                    onClick={() => onClick(p.id)}
                    muted={props.mutes.has(p.id)} />
            )
        })
        resize()
        return online
    }, [props, connect, props.mutes])

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

    function resize() {
        const dom = document.getElementsByClassName("viewer__canvas")[0]
        const height = (dom as HTMLCanvasElement).height
        ref.current!.style.height = `${height}px`
    }

    return (
        <table className="viewer__tab-wrap">
            <tbody>
                <tr>
                    <td onClick={() => onClick("normal")}
                        className={classnames({
                            "viewer__tab-switch": true,
                            "viewer__tab-switch--select": props.mode === "normal"
                        })} >
                        通常
                    </td>
                    <td onClick={() => onClick("overall")}
                        className={classnames({
                            "viewer__tab-switch": true,
                            "viewer__tab-switch--select": props.mode === "overall"
                        })} >
                        全体図
                    </td>
                    <td onClick={() => onClick(select)}
                        className={classnames({
                            "viewer__tab-switch": true,
                            "viewer__tab-switch--select": props.mode !== "normal" && props.mode !== "overall"
                        })} >
                        人物
                    </td>
                </tr>
                <tr>
                    <td colSpan={3}>
                        <div className="viewer__side_contents" ref={ref}>
                            通話中 -- {talking.length}
                            {talking}
                            <br />
                            オンライン -- {online.length}
                            {online}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}