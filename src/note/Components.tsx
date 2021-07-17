import React, { useState } from "react";
import AceEditor from "react-ace";
import ReactMarkdown, { propTypes } from "react-markdown";
import gfm from 'remark-gfm'
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-twilight";
import { useDropzone } from "react-dropzone";


export const sample = ` テストテスト `

// export const sample = `
// ## これは何？
// ボイスチャットです。
// - いつやるかわから無いけど次回OB会は人数が多くなりそう
// - gather.townの制限(25人)を超える可能性が高い
// - 人数無制限の有料版はクソ高い
// - じゃあ自前で実装すれば良いのでは...？

// という考えで作ってるやつです。OB会が企画された頃にはコロナ禍終わってて普通に対面でできるかもしれないが...

// ## いまできること
// - 動き回れる系のボイスチャット(PCのスペック次第だけど人数無制限)
// - DiscordのITCサーバに入ってる人のみアクセス可能なログイン機能
// - AWS使ってるから無料ではないけど安い（月額50円くらいのはず）

// ## で、この画面は何？
// ついでに実装してみたマークダウンエディタ

// ## 最後に
// 何か文字が入力されてないと画面がバグります助けて  
// いい感じのテクスチャを作りたい...
// `

interface EditorProps {
    value?: string
    setValue: Function
    className?: string
}
export function EditorCore(props: EditorProps) {
    const [selector, setSelector] = useState([0, 0])

    function onChange(value: string | undefined, e: any) {
        props.setValue(value)
    }

    function onSelectionChange(e: any) {
        setSelector([e.cursor.row, e.cursor.column])
    }

    return (
        <div className={props.className}>
            <AceEditor
                className="editor"
                width="100%"
                height="calc(100vh - 100px)"
                mode="markdown"
                theme="twilight"
                name="ace-editor"
                onChange={onChange}
                onSelectionChange={onSelectionChange}
                wrapEnabled={true}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                value={props.value}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: false,
                    enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 2,
                }} />
        </div>
    );
}


interface DropzoneProps {
    value: string
    setValue: Function
    className?: string
}
export function Dropzone(props: DropzoneProps) {
    const [selector, setSelector] = useState([0, 0])

    function onDrop(acceptedFiles: any) {
        console.log(acceptedFiles)
        const str = props.value.split("\n")[selector[0]]
        str.slice(0, selector[1]) + "hoge" + str.slice(selector[1]);
    }
    const { getRootProps, isDragActive } = useDropzone({ onDrop })

    let dom: JSX.Element
    if (isDragActive) {
        dom = (
            <EditorCore value={props.value} setValue={props.setValue} />
        );
    } else {
        dom = (
            <EditorCore value={props.value} setValue={props.setValue} />
        );
    }
    return (
        <div {...getRootProps()}>
            {dom}
        </div>
    )
}


interface RenderProps {
    value: string
    className?: string
}
export function Render(props: RenderProps) {
    return (
        <div className={props.className}>
            <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[[gfm, { singleTilde: false }]]}>{props.value}</ReactMarkdown>
            </div>
        </div>
    )
}