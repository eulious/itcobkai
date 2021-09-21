import { createContext, Dispatch } from "react"

/*
useContextによる状態管理
ノート機能が充実してきたらがっつり使う予定
*/

export interface State {
    footerText: string
    roles: { [key: string]: string[] };
}

export type Type = "FOOTER" | "ROLES"

export interface Action {
    type: Type
    text?: string
    roles?: { [key: string]: string[] };
}

export const initState: State = {
    footerText: "",
    roles: {}
}

export const Context = createContext({} as {
    state: State
    dispatch: Dispatch<Action>
})

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "FOOTER":
            return footer(state, action.text!);
        case "ROLES":
            return roles(state, action.roles!);
        default:
            return state
    }
}

function footer(state: State, text: string) {
    state.footerText = text;
    return { ...state }
}

function roles(state: State, roles: { [key: string]: string[] }) {
    state.roles = roles
    return { ...state }
}