import React, { ReactNode, useMemo } from "react";

interface HeaderProps {
    mode?: "rtc" | "note"
    children?: ReactNode
}
export default function Header(props: HeaderProps) {
    function onClick(mode: string) {
        location.href = `${location.href.split('?')[0]}?mode=${mode}`
    }

    const dom = useMemo(() => {
        switch (props.mode) {
            case "rtc":
                return (
                    <tr>
                        <td className="td_select">RTC</td>
                        <td className="td_unselect" onClick={() => onClick("note")}>NOTE</td>
                    </tr>
                )
            case "note":
                return (
                    <tr>
                        <td className="td_unselect" onClick={() => onClick("rtcViewer")}>RTC</td>
                        <td className="td_select">NOTE</td>
                    </tr>
                )
        }
    }, [props.mode])

    return (
        <header className="header">
            <div className="left">
                <div className="title">ITCOBKAI</div>
                {props.mode && <table className="toggle"><tbody>{dom}</tbody></table>}
            </div>
            {props.children}
        </header>
    )
}

interface ToggleProps {
    mode: string
    modes: [string, string]
    setMode: Function
}
export function Toggle(props: ToggleProps) {
    function onClick(i: number) {
        // location.href = `${location.href.split('?')[0]}?mode=${mode}`
        props.setMode(props.modes[i])
    }

    const dom = useMemo(() => {
        if (props.modes.indexOf(props.mode)) {
            return (
                <tr>
                    <td className="td_select">{props.modes[0].toUpperCase()}</td>
                    <td className="td_unselect" onClick={() => onClick(1)}>{props.modes[1].toUpperCase()}</td>
                </tr>
            )
        } else {
            return (
                <tr>
                    <td className="td_select" onClick={() => onClick(0)}>{props.modes[0].toUpperCase()}</td>
                    <td className="td_unselect">{props.modes[1].toUpperCase()}</td>
                </tr>
            )
        }
    }, [props.mode])

    return (
        <table className="toggle">
            <tbody>{dom}</tbody>
        </table>
    )
}