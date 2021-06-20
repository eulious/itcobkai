import { createContext, Dispatch } from "react"

export interface State {
    footerText: string
}

export type Type = "FOOTER"

export interface Action {
    type: Type
    text: string
}

export const initState: State = {
    footerText: ""
}

export const Context = createContext({} as {
    state: State
    dispatch: Dispatch<Action>
})

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "FOOTER":
            return footer(state, action.text!);
        default:
            return state
    }
}

function footer(state: State, text: string) {
    state.footerText = text;
    return { ...state }
}