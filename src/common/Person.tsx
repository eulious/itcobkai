/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Profile } from "../viewer/Persons"
import { avator } from "./Common"
import { styleValue } from './Style'
import { CSSObject } from '@emotion/serialize'

// サイドバーに表示されるプレイヤー
// 親コンポーネント: rtc.viewer.SideMenu, rtc.Master.ClientAudio
interface PersonInfoProps {
    profile: Profile;
    muted?: boolean;
    selected?: boolean;
    onClick?: Function;
}
export default function PersonInfo(props: PersonInfoProps) {
    function onClick() {
        if (props.onClick) props.onClick()
    }

    return (
        <table onClick={onClick} css={[
            style.contents,
            props.selected && style.contentSelect,
            !props.selected && style.contentUnselect
        ]}>
            <tbody><tr>
                <td css={style.imgBox}>
                    <img css={[style.thumbnail, props.muted && style.thumbnailMuted]}
                        src={avator(props.profile.thumbnail)} />
                </td>
                <td >
                    <div> {props.profile.name} </div>
                    <div>
                        <span >{props.profile.year}, {props.profile.faculty}</span>
                        {props.profile.member.dtm ? <span css={style.dtm}>D</span> : <span />}
                        {props.profile.member.prog ? <span css={style.prog}>P</span> : <span />}
                        {props.profile.member.cg ? <span css={style.cg}>C</span> : <span />}
                        {props.profile.member.mv ? <span css={style.mv}>M</span> : <span />}
                    </div> </td>
            </tr></tbody>
        </table >
    )
}


const member: CSSObject = {
    borderRadius: "50%",
    boxSizing: "border-box",
    lineHeight: "1.2em",
    width: "1.1em",
    height: "1.1em",
    textAlign: "center",
    margin: "auto 2px",
    color: "#ccc",
}

const style = {
    imgBox: css({
        width: "50px",
        verticalAlign: "top",
    }),

    thumbnail: css({
        borderRadius: "50%",
        width: "50px",
        height: "50px",

    }),

    thumbnailMuted: css({
        opacity: "0.2"
    }),

    contents: css({
        borderBottom: `1px solid ${styleValue.black3}`,
        width: "250px"
    }),

    contentSelect: css({
        backgroundcolor: styleValue.black3
    }),

    contentUnselect: css({
        ":hover": {
            backgroundColor: styleValue.black3
        }
    }),

    dtm: css({
        ...member,
        backgroundColor: "#4cadd0",
    }),

    cg: css({
        ...member,
        backgroundColor: "#45bf84",
    }),

    prog: css({
        ...member,
        backgroundColor: "#c16b47",
    }),

    mv: css({
        ...member,
        backgroundColor: "#baa643"
    })
}