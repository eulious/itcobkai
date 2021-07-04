import React, { ReactNode, useMemo } from "react";

interface HeaderProps {
    mode: "rtc" | "note" | undefined
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