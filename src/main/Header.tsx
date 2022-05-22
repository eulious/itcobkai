/** @jsx jsx */
import { ReactNode } from "react";
import { css, jsx } from '@emotion/react'
import { styleValue } from "../common/Style";

// ヘッダ部
// 親コンポーネント: main.Main
interface HeaderProps {
    mode?: "rtc" | "note"
    onEdit?: boolean
    children?: ReactNode
}
export default function Header(props: HeaderProps) {
    return (
        <header css={style.header}>
            <div css={style.left}>
                <div css={style.title}>ITCOBKAI</div>
            </div>
            {props.children}
        </header>
    )
}


const style = {
    header: css({
        display: "flex",
        justifyContent: "space-between",
        width: "100",
        height: styleValue.paddingTop,
        borderBottom: "solid 1px #000",
        backgroundColor: styleValue.black3,
        color: "white",
        boxShadow: "2px 2px 2px rgba(25, 25, 25, 0.6)",
    }),

    title: css({
        verticalAlign: "middle",
        fontSize: "28px",
        padding: "5px 10px 10px 20px",
        fontWeight: "bold",
        color: "#ddd"
    }),

    left: css({
        display: "flex"
    })
}