import React, { ChangeEvent } from "react"

interface TextBoxProps {
    setValue: Function
    value: any
    form: string
    placeholder: string
    maxLength?: number
}
export function TextBox(props: TextBoxProps) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
        props.value[props.form] = e.target!.value
        props.setValue({ ...props.value })
        console.log(props.value)
    }

    return (
        <div className="auth__form-item">
            <input type="text"
                onChange={onChange}
                maxLength={props.maxLength}
                placeholder={props.placeholder}
                value={props.value[props.form]}
            />
        </div>
    )
}


interface SelectBoxProps {
    setValue: Function
    value: any
}
export function SelectBox(props: SelectBoxProps) {
    return (
        <>
            <div className="auth__form-item">
                年度:
            </div>
            <select id="auth__year">
                <option value="">選択してください</option>
                <option value="0">神</option>
                <option value="1">１期生</option>
                <option value="2">２期生</option>
                <option value="3">３期生</option>
                <option value="4">４期生</option>
                <option value="5">５期生</option>
                <option value="6">６期生</option>
                <option value="7">７期生</option>
                <option value="8">８期生</option>
                <option value="9">９期生</option>
            </select>
        </>
    )
}


interface ClubCheckBoxProps {
    setValue: Function
    value: any
    form: string
}
export function ClubCheckBox(props: ClubCheckBoxProps) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
        props.value[props.form] = e.target!.value
        props.setValue({ ...props.value })
    }
    return (
        <span className="auth__checks">
            <input type="checkbox" name={props.form} onChange={onChange} />
            <label htmlFor={props.form}>{props.form.toUpperCase()}</label>
        </span>
    )
}


interface TextAreaProps {
    setValue: Function
    value: any
}
export function TextArea(props: TextAreaProps) {
    function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
        props.value["detail"] = e.target!.value
        props.setValue({ ...props.value })
    }
    return (
        <div className="auth__form-item">
            <div>
                プロフィール
            </div>
            <textarea onChange={onChange}
                rows={5}
                maxLength={200}
                placeholder="なにか一言"></textarea>
        </div>
    )
}