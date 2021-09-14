import React, { useState, ReactNode, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { request } from "../common/Common";
import { S3_URL } from "../common/Config";
import AceEditor from "react-ace";
import rehypeRaw from 'rehype-raw'
import gfm from 'remark-gfm'
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-twilight";

interface EditorProps {
    value?: string
    setValue: Function
    className?: string
}
export function EditorCore(props: EditorProps) {
    const [selector, setSelector] = useState(0)

    function onChange(value: string | undefined, e: any) {
        props.setValue(value)
    }

    function onCursorChange(e: any) {
        setSelector(e.cursor.row)
    }

    function onDrop(asset_id: string, tpe: string) {
        let value = ""
        props.value?.split("\n").forEach((line, i) => {
            value += line + "\n"
            if (i === selector) value += `@import-${tpe}{"id": "${asset_id}"}\n`
        })
        props.setValue(value.slice(0, -1))
    }

    return (
        <Dropzone className="editor__editor" onDrop={onDrop}>
            <AceEditor
                width="100%"
                height="calc(100vh - 100px)"
                mode="markdown"
                theme="twilight"
                name="ace-editor"
                onChange={onChange}
                onCursorChange={onCursorChange}
                wrapEnabled={true}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                value={props.value}
                setOptions={{
                    // enableBasicAutocompletion: true,
                    // enableLiveAutocompletion: false,
                    // enableSnippets: false,
                    showLineNumbers: true,
                    tabSize: 2,
                }} />
        </Dropzone>
    );
}


interface DropzoneProps {
    children?: ReactNode
    className?: string
    onDrop: Function
}
function Dropzone(props: DropzoneProps) {
    const { getRootProps, isDragActive } = useDropzone({ onDrop })
    const [isUploading, setIsUploading] = useState(false)

    async function onDrop(files: any) {
        const f = files[0]
        let tpe = ""
        if (files[0].type === "audio/mpeg") {
            tpe = "mp3"
        } else if (files[0].type === "image/jpeg") {
            tpe = "jpg"
        } else {
            return
        }
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];
            setIsUploading(true)
            const res = await request("POST", "/notes/assets", {
                type: tpe, base64: base64
            })
            setIsUploading(false)
            props.onDrop(res.asset_id, tpe)
        };
    }

    return (
        <div {...getRootProps()} className={props.className}>
            {(() => {
                if (isDragActive) {
                    return (
                        <div className="editor__drop">
                            <p className="editor__drop_message">ここにドラッグして下さい</p>
                        </div>
                    )
                } else if (isUploading) {
                    return (
                        <div className="editor__drop">
                            <p className="editor__drop_message--upload">アップロードしています...</p>
                        </div>
                    )
                } else {
                    return props.children
                }
            })()}
        </div>
    )
}


interface RenderProps {
    value?: string
    className?: string
}
export function Render(props: RenderProps) {
    const value = useMemo(() => {
        let value = ""
        props.value?.split("\n").forEach((line) => {
            if (line.match(/\ *@import-jpg/)) {
                const d = parse(line.replace(/\ *@import-jpg/, ""))
                value += `<img src="${S3_URL}/note/jpg/${d.id}.jpg" height="${d.height}" width="${d.width}"></img>\n`
            } else if (line.match(/\ *@import-mp3/)) {
                const d = parse(line.replace(/\ *@import-mp3/, ""))
                value += `<audio src="${S3_URL}/note/mp3/${d.id}.mp3" controls preload="none"></audio>\n`
            } else {
                value += line + "\n"
            }
        })
        return value
    }, [props.value])

    function parse(line: string) {
        try {
            return JSON.parse(line.replace(/\ *@import-jpg/, ""))
        } catch {
            return {}
        }
    }

    return (
        <div className={props.className}>
            <div className="markdown-body">
                <ReactMarkdown
                    remarkPlugins={[[gfm, { singleTilde: false }]]}
                    rehypePlugins={[rehypeRaw]}
                    children={value} />
            </div>
        </div>
    )
}