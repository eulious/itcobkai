import React from "react";
import { createContext, Dispatch } from "react"
import Signup from "../main/Signup";

/*
useContextによる状態管理
タブ機能に関わる部分のみ抽出
多分使わない
*/

export interface Tab {
    index: number
    elms: JSX.Element[]
    urls: string[]
    texts: string[]
}


interface Action {
    type: "NEW" | "TEXT" | "INDEX" | "DELETE"
    url?: string
    text?: string
    isNew?: boolean
    index?: number
}


export const initTab: Tab = {
    index: 0,
    elms: [],
    texts: [],
    urls: []
}


export const Context = createContext({} as {
    tab: Tab
    transition: Dispatch<Action>
})


export function reducer(tab: Tab, action: Action): Tab {
    switch (action.type) {
        case "NEW":
            return newtab(tab, action.url!, action.text!, action.isNew!);
        case "DELETE":
            return deleteTab(tab, action.index!);
        case "NEW":
            return tabText(tab, action.text!);
        case "NEW":
            return tabIndex(tab, action.index!);
        default:
            return tab
    }
}


function newtab(tab: Tab, url: string, text: string, isNew: boolean) {
    const elm: JSX.Element = (() => {
        if (url.match("^/auth")) {
            return <Signup />
        } else {
            return <div />
        }
    })()

    if (isNew) {
        return {
            index: tab.index,
            elms: [...tab.elms, elm],
            urls: [...tab.urls, url],
            texts: [...tab.texts, text]
        }
    } else {
        tab.elms[tab.index] = elm;
        tab.urls[tab.index] = url;
        tab.texts[tab.index] = text;
        return { ...tab }
    }
}


function tabText(tab: Tab, text: string) {
    tab.texts[tab.index] = text
    return { ...tab }
}


function tabIndex(tab: Tab, index: number) {
    tab.index = index
    return { ...tab }
}


function deleteTab(tab: Tab, index: number) {
    tab.elms[index] = <div />
    tab.urls[index] = "deleted"
    return { ...tab }
}