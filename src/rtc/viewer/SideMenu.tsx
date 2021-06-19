import React, { useEffect, useMemo, useState } from "react"
import { Connection } from "./Connector"
import PersonInfo from "./Person"

interface SideMenuProps {
    conn?: Connection
}
export default function SideMenu(props: SideMenuProps) {
    const [mode, setMode] = useState("all")
    const [connect, setConnect] = useState<Set<string>>(new Set<string>())

    const players = useMemo(() => {
        const players: JSX.Element[] = []
        if (!props.conn) return [<div key={0} />]
        props.conn.all.forEach((p, i) => {
            if (mode === "talking" && !(p.id in connect)) return
            players.push(<PersonInfo key={i} person={p} />)
        })
        return players
    }, [mode, props, connect])

    useEffect(() => {
        if (!props.conn) return
        for (let id of props.conn.connect) {
            connect.add(id)
        }
        for (let id of props.conn.disconnect) {
            if (!(id in connect)) continue
            connect.delete(id)
        }
        setConnect(new Set(...connect))
    }, [mode, props])

    return (
        <table className="viewer__tab-wrap">
            <tbody>
                <tr>
                    <td onClick={() => setMode("talking")}
                        className={"viewer__tab-switch " + (mode === "talking" ? "viewer__tab-switch--select" : "")}>
                        通話中
                    </td>
                    <td onClick={() => setMode("all")}
                        className={"viewer__tab-switch " + (mode === "all" ? "viewer__tab-switch--select" : "")}>
                        オンライン
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        {players}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}