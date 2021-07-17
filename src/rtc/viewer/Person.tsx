import React from "react"
import { AVATAR_URL } from "../../common/Config"
import { Profile } from "./Persons"

export interface Person {
    img: HTMLImageElement
    profile: Profile
    x: number
    y: number
    id: string
}

interface PersonInfoProps {
    person: Person;
}
export default function PersonInfo(props: PersonInfoProps) {
    const profile = props.person.profile

    return (
        <table className="user__contents">
            <tbody><tr>
                <td className="user__img_box">
                    <img className="user__thumbnail" src={`${AVATAR_URL}/${profile.thumbnail}.png`} />
                </td>
                <td className="user__profile">
                    <div> {profile.name} </div>
                    <div>
                        <span >{profile.year}, {profile.faculty}科</span>
                        {profile.member.dtm ? <span className="user__dtm">D</span> : <span />}
                        {profile.member.prog ? <span className="user__prog">P</span> : <span />}
                        {profile.member.cg ? <span className="user__cg">C</span> : <span />}
                        {profile.member.mv ? <span className="user__mv">M</span> : <span />}
                    </div> </td>
            </tr></tbody>
        </table>
    )
}