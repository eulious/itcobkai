import React from "react";
import AceEditor from "react-ace";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm'
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-twilight";

export const sample = `
## これは何？
ボイスチャットです。
- いつやるかわから無いけど次回OB会は人数が多くなりそう
- gather.townの制限(25人)を超える可能性が高い
- 人数無制限の有料版はクソ高い
- じゃあ自前で実装すれば良いのでは...？

という考えで作ってるやつです。OB会が企画された頃にはコロナ禍終わってて普通に対面でできるかもしれないが...

## いまできること
- 動き回れる系のボイスチャット(PCのスペック次第だけど人数無制限)
- DiscordのITCサーバに入ってる人のみアクセス可能なログイン機能
- AWS使ってるから無料ではないけど安い（月額50円くらいのはず）

## で、この画面は何？
ついでに実装してみたマークダウンエディタ

## 最後に
何か文字が入力されてないと画面がバグります助けて  
いい感じのテクスチャを作りたい...
`

interface EditorProps {
    value: string
    setValue: Function
    className?: string
}
export function EditorCore(props: EditorProps) {
    function onChange(value: string | undefined) {
        if (value) props.setValue(value)
    }

    return (
        <div className={props.className}>
            <AceEditor
                className="editor"
                width="50vw"
                height="calc(100vh - 80px)"
                mode="markdown"
                theme="twilight"
                name="ace-editor"
                onChange={onChange}
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