import { createContext, Dispatch } from "react"
import { Author } from "../note/NoteList"
import { Profile } from "../rtc/viewer/Persons"

/*
useContextによる状態管理
*/

export interface State {
    footerText: string
    profiles: { [key: string]: Profile },
    keys: any,
    master: boolean,
    authors: Author[],
    roles: { [key: string]: string[] };
    inRTC: boolean,
}

export type Type = "FOOTER" | "ROLES" | "INIT" | "RTC"

export interface Action {
    type: Type
    init?: any
    text?: string
    inRTC?: boolean
    roles?: { [key: string]: string[] };
}

export const initState: State = {
    footerText: "",
    profiles: {},
    keys: {},
    master: false,
    authors: [],
    roles: {},
    inRTC: false
}

export const Context = createContext({} as {
    state: State
    dispatch: Dispatch<Action>
})

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "INIT":
            return init(state, action.init!);
        case "FOOTER":
            return footer(state, action.text!);
        case "RTC":
            return inRTC(state, action.inRTC!);
        default:
            return state
    }
}

function footer(state: State, text: string) {
    state.footerText = text;
    return { ...state }
}

function init(state: State, init: any) {
    return { state, ...init }
}

function inRTC(state: State, inRTC: boolean) {
    return { ...state, inRTC: inRTC }
}