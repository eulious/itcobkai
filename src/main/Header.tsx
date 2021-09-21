import React, { ReactNode, useMemo } from "react";

// ヘッダ部
// 親コンポーネント: main.Main
interface HeaderProps {
    mode?: "rtc" | "note"
    children?: ReactNode
}
export default function Header(props: HeaderProps) {
    function onClick(mode: string) {
        location.href = `${location.href.split('?')[0]}?mode=${mode}`
    }

    return (
        <header className="header__header">
            <div className="header__left">
                <div className="header__title">ITCOBKAI</div>
                {props.mode && <Toggle
                    mode={props.mode}
                    modes={["rtc", "note"]}
                    setMode={onClick}
                />}
            </div>
            {props.children}
        </header>
    )
}


// ２つの状態を切り替えるトグルボタン
// NOTEとRTCなど
interface ToggleProps {
    mode: string
    modes: [string, string]
    setMode: Function
}
export function Toggle(props: ToggleProps) {
    function onClick(i: number) {
        props.setMode(props.modes[i])
    }

    const dom = useMemo(() => {
        if (props.modes.indexOf(props.mode)) {
            return (
                <tr>
                    <td className="header__td_unselect" onClick={() => onClick(0)}>{props.modes[0].toUpperCase()}</td>
                    <td className="header__td_select">{props.modes[1].toUpperCase()}</td>
                </tr>
            )
        } else {
            return (
                <tr>
                    <td className="header__td_select">{props.modes[0].toUpperCase()}</td>
                    <td className="header__td_unselect" onClick={() => onClick(1)}>{props.modes[1].toUpperCase()}</td>
                </tr>
            )
        }
    }, [props.mode])

    return (
        <table className="header__toggle">
            <tbody>{dom}</tbody>
        </table>
    )
}