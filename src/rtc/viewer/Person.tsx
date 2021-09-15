import React from "react"
import { avator } from "../../common/Common"
import { Profile } from "./Persons"

export interface Person {
    img: HTMLImageElement
    mute: boolean
    profile: Profile
    x: number
    y: number
    id: string
}

interface PersonInfoProps {
    profile: Profile;
    muted?: boolean;
}
export default function PersonInfo(props: PersonInfoProps) {
    return (
        <table className="user__contents">
            <tbody><tr>
                <td className="user__img_box">
                    <img className={"user__thumbnail " + (props.muted ? "user__thumbnail--muted" : "")}
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