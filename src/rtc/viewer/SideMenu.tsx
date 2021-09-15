import React, { useEffect, useMemo, useRef, useState } from "react"
import PersonInfo, { Person } from "./Person"
import { Connection } from "./Connector"
import classnames from "classnames"
import useInterval from "../../common/Hooks"

interface SideMenuProps {
    conn?: Connection
    player?: Person
    mutes: Set<string>
}
export default function SideMenu(props: SideMenuProps) {
    const [connect, setConnect] = useState<Set<string>>(new Set<string>())
    const ref = useRef<HTMLDivElement>(null)

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
        props.conn.all.forEach((p, i) => {
            if (!(connect.has(p.id))) return
            players.push(
                <PersonInfo
                    key={i}
                    profile={p.profile}
                    muted={props.mutes.has(p.id)} />
            )
        })
        return players
    }, [props, connect, props.mutes])

    const others = useMemo(() => {
        const others: JSX.Element[] = []
        if (!props.conn) return others
        props.conn.all.forEach((p, i) => {
            if (connect.has(p.id)) return
            others.push(
                <PersonInfo
                    key={i}
                    profile={p.profile}
                    muted={props.mutes.has(p.id)} />
            )
        })
        return others
    }, [props, connect, props.mutes])

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
    }, [props])

    return (
        <div className="viewer__tab-wrap">
            <div className="viewer__side_contents" ref={ref}>
                通話中
                {players}
                <br />
                オンライン
                {others}
            </div>
        </div>
    )
}