/** @jsx jsx */
import { useEffect, useMemo, useRef, useState } from "react"
import { Connection } from "../map/Connector"
import PersonInfo from "../common/Person"
import { css, jsx } from '@emotion/react'
import { Person } from "./Persons"
import { mixin, styleValue } from "../common/Style"

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
        const dom = document.querySelector('[data-id="map"]')
        const height = (dom as HTMLCanvasElement).height
        ref.current!.style.height = `${height}px`
    }

    return (
        <table css={style.wrap}>
            <tbody>
                <tr>
                    <td onClick={() => onClick("normal")}
                        css={[style.switch, props.mode === "normal" && style.select]} >
                        通常
                    </td>
                    <td onClick={() => onClick("overall")}
                        css={[style.switch, props.mode === "overall" && style.select]} >
                        全体図
                    </td>
                    <td onClick={() => onClick(select)}
                        css={[style.switch, props.mode !== "normal" && props.mode !== "overall" && style.select]} >
                        人物
                    </td>
                </tr>
                <tr>
                    <td colSpan={3}>
                        <div css={style.contents} ref={ref}>
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


const style = {
    wrap: css({
        tableLayout: "fixed",
        width: "250px",
    }),

    switch: css({
        cursor: "pointer",
        textAlign: "center",
        borderBottom: `3px solid ${styleValue.black3}`,
        height: "2em",
        order: -1,
        ":hover": {
            color: "#888"
        },
    }),

    select: css({
        borderBottom: "3px solid white",
    }),

    contents: css({
        ...mixin.scrollbar,
        color: "#ccc",
        overflowY: "scroll",
        boxSizing: "border-box",
        overflowX: "hidden",
        height: "calc(100vh - 300px)",
    })
}