import { createContext, Dispatch } from "react"
import { Profile } from "../viewer/Persons"

/*
useContextによる状態管理
0: Masterが起動していない
1: リロード中
2: 初期化中
3: 起動可能
*/

export interface State {
    profiles: { [key: string]: Profile }
    keys: any
    id: string
    actives: string[]
    master: boolean
}

export type Type = "INIT" | "ACTIVE"

export interface Action {
    type: Type
    init?: any
    actives?: string[],
}

export const initState: State = {
    profiles: {},
    actives: [],
    id: "",
    keys: {},
    master: false,
}

export const Context = createContext({} as {
    state: State
    dispatch: Dispatch<Action>
})

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "INIT":
            return init(state, action.init!);
        case "ACTIVE":
            return active(state, action.actives!)
        default:
            return state
    }
}

function init(state: State, init: any): State {
    return { state, ...init }
}

function active(state: State, actives: string[]): State {
    return { ...state, actives: actives }
}