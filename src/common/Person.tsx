import classNames from "classnames"
import React from "react"
import { avator } from "./Common"
import { Profile } from "../rtc/viewer/Persons"

// サイドバーに表示されるプレイヤー
// 親コンポーネント: rtc.viewer.SideMenu, rtc.Master.ClientAudio
interface PersonInfoProps {
    profile: Profile;
    muted?: boolean;
    selected?: boolean;
    onClick?: Function;
}
export default function PersonInfo(props: PersonInfoProps) {
    const className = classNames({
        "user__contents": true,
        "user__contents--select": props.selected,
        "user__contents--unselect": !props.selected,
    })

    const thumbClass = classNames({
        "user__thumbnail": true,
        "user__thumbnail--muted": props.muted
    })

    function onClick() {
        if (props.onClick) props.onClick()
    }

    return (
        <table onClick={onClick} className={className}>
            <tbody><tr>
                <td className="user__img_box">
                    <img className={thumbClass}
                        src={avator(props.profile.thumbnail)} />
                </td>
                <td className="user__profile">
                    <div> {props.profile.name} </div>
                    <div>
                        <span >{props.profile.year}, {props.profile.faculty}</span>
                        {props.profile.member.dtm ? <span className="user__dtm">D</span> : <span />}
                        {props.profile.member.prog ? <span className="user__prog">P</span> : <span />}
                        {props.profile.member.cg ? <span className="user__cg">C</span> : <span />}
                        {props.profile.member.mv ? <span className="user__mv">M</span> : <span />}
                    </div> </td>
            </tr></tbody>
        </table>
    )
}