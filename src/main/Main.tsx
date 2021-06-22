import React, { useEffect } from "react";
import { getParam, request } from "../common/Common";

export default function Main() {
    const params = getParam()

    async function discord() {
        if (!(params.code)) return
        const res = await request("POST", "/code", {
            code: params.code, redirect: location.href.split("?")[0]
        })
        console.log(res)
    }

    useEffect(() => {
        discord()
    }, [])

    return (<div />)
}