import React, { useEffect, useMemo, useState } from "react"
import PersonInfo, { Person } from "./Person"
import { Connection } from "./Connector"
import classnames from "classnames"

interface SideMenuProps {
    conn?: Connection
    player?: Person
    mutes: Set<string>
}
export default function SideMenu(props: SideMenuProps) {
    const [mode, setMode] = useState("talking")
    const [connect, setConnect] = useState<Set<string>>(new Set<string>())

    const players = useMemo(() => {
        const players: JSX.Element[] = []
        if (props.player) {
            players.push(
                <PersonInfo
                    key={-1}
                    profile={props.player.profile}
                    muted={props.mutes.has(props.player.id)} />
            )
        }
        if (!props.conn) return players
        // props.conn.all.map(p => (props.player!.x - p.x)**2+(props.player!.y - p.y)**2).sort()
        props.conn.all.forEach((p, i) => {
            if ((mode === "talking" && !(connect.has(p.id)))) return
            players.push(
                <PersonInfo
                    key={i}
                    profile={p.profile}
                    muted={props.mutes.has(p.id)} />
            )
        })
        return players
    }, [mode, props, connect, props.mutes])

    useEffect(() => {
        if (!props.conn) return
        for (let id of props.conn.connect) {
            connect.add(id)
            console.log("connect", id)
        }
        for (let id of props.conn.disconnect) {
            if (!(connect.has(id))) continue
            connect.delete(id)
            console.log("disconnect", id)
        }
        setConnect(new Set(connect))
    }, [mode, props])

    return (
        <table className="viewer__tab-wrap">
            <tbody>
                <tr>
                    <td onClick={() => setMode("talking")}
                        className={classnames({
                            "viewer__tab-switch": true,
                            "viewer__tab-switch--select": mode === "talking"
                        })} >
                        通話中
                    </td>
                    <td onClick={() => setMode("all")}
                        className={classnames({
                            "viewer__tab-switch": true,
                            "viewer__tab-switch--select": mode === "all"
                        })} >
                        オンライン
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <div className="viewer__side_contents">
                            {players}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}