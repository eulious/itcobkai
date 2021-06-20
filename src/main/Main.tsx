import React, { useEffect } from "react";
import { getParam, request } from "../common/Common";

export default function Main() {
    const params = getParam()

    async function discord() {
        if (!("code" in params)) return
        const res = await request("POST", "code", {
            code: params.codee,
            redirect: location.href.split("&")[0]
        })
        console.log(res)
    }

    useEffect(() => {
        discord()
    }, [])

    return (<div />)
}