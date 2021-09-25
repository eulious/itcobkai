import React, { useState } from "react"

export function Checkbox(props: { label: string, onChange: Function }) {
    const [checked, setChecked] = useState(false)

    function onChange() {
        props.onChange(!checked)
        setChecked(!checked)
    }

    return (
        <span onClick={onChange}>
            <input type="checkbox" checked={checked} onChange={() => { }} />
            {props.label}
        </span>
    )
}