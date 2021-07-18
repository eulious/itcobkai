
import React, { useState, ReactNode, useContext, useEffect, ChangeEvent } from "react";
import { Context } from "../common/Context";
import { request } from "../common/Common";

interface NoteSettingProps {
}
export function NoteSetting(props: NoteSettingProps) {
    const [roles, setRoles] = useState<string[]>([])
    console.log(roles)

    function addRole(role: string) {
        if (roles.indexOf(role) >= 0) return
        setRoles([...roles, role])
    }

    function deleteRole(role: string) {
        setRoles(roles.filter(s => s !== role))
    }

    return (
        <div>
            <RoleSelect addRole={addRole} />
            <RoleList roles={roles} deleteRole={deleteRole} />
        </div>
    )
}


interface RoleSelectProps {
    addRole: Function
}
export function RoleSelect(props: RoleSelectProps) {
    const { state, dispatch } = useContext(Context)
    const [attr, setAttr] = useState("部門")
    const [role, setRole] = useState("現役CG部")

    useEffect(() => {
        if (state.roles.length) return
        request("GET", "/notes/init").then(res => {
            console.log(res)
            dispatch({ type: "ROLES", roles: res.roles })
        })
    }, [])

    function selectAttr(e: ChangeEvent<HTMLSelectElement>) {
        setAttr(e.currentTarget.value)
    }

    function selectRole(e: ChangeEvent<HTMLSelectElement>) {
        setRole(e.currentTarget.value)
    }

    function add() {
        props.addRole(role)
    }

    return (
        <div className="note_config__select_wrapper">
            <select className="note_config__select_attr"
                value={attr}
                onChange={selectAttr}
                size={8}>
                {Object.keys(state.roles).map((key: string, i: number) => (
                    <option key={i} value={key}>{key}</option>
                ))}
            </select>
            <select className="note_config__select_attr"
                value={role}
                onChange={selectRole}
                size={8}>
                {state.roles[attr]?.map((key: string, i: number) => (
                    <option key={i} value={key}>{key}</option>
                ))}
            </select>
            <div className="note_config__select_confirm">
                <div className="btn-flat" onClick={add}>追加</div>
            </div>
        </div>
    )
}


interface RoleListProps {
    deleteRole: Function;
    roles: string[];
}
function RoleList(props: RoleListProps) {
    const dom = props.roles.map((role, i) => (
        <tr key={i}>
            <td className="note_config__rolelist_role">{role}</td>
            <td className="note_config__rolelist_delete"
                onClick={() => props.deleteRole(role)}>
                削除</td>
        </tr>
    ))

    return (
        <table className="note_config__rolelist">
            <tbody>
                {dom}
            </tbody>
        </table>
    )
}