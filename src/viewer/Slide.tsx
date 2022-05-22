/** @jsx jsx */
import { useState } from "react"
import { Button } from "../common/Style"
import { css, jsx } from '@emotion/react'

interface NoteProps {
    size: number
    content: string
    onChange: Function
    canEdit: boolean
    visible: boolean
}
export default function Slide(props: NoteProps) {
    const [head, setHead] = useState(0)
    const src = "https://docs.google.com/presentation/d/e/2PACX-1vSuNrierD_6sNaTSFBil1-9E6kqy9NCOyK9kHYYBnp7wyMDhxEL8xAnFwZxQTYsPUESE0pdNS86c_xl/embed?start=false&loop=false&delayms=3000"

    function edit() {
        window.open("https://docs.google.com/presentation/d/1XoL4ufOzjGqYILQ9sTPUVoT7X2jkLeQmbjJa4fk_zUw/edit")
    }

    function reload() {
        setHead(head + 1)
    }

    return (
        <div style={{ width: `${props.size}px`, height: `${props.size}px` }}
            css={[style.wrapper, !props.visible && style.disable]}>
            <div>
                <Button onClick={() => edit()}>編集</Button>
                <Button onClick={() => reload()}>更新</Button>
            </div>
            <iframe
                src={`${src}0000&reload=${head}${Math.floor(new Date().getTime() / (60 * 30 * 1000))}`}
                frameBorder="0"
                width={props.size}
                height={props.size * 1109 / 1440}
                allowFullScreen={true} />
        </div >
    )
}


const style = {
    wrapper: css({
        padding: "5px 20px",
    }),

    disable: css({
        display: "none"
    })
}