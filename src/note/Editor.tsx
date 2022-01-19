import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Render } from "./NoteViewer";
import AceEditor from "react-ace";
import request from "../common/Request";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-twilight";
import classnames from "classnames";


interface EditorProps {
    content: string
    onChange: Function
    width: number
    height: number
}
export default function Editor(props: EditorProps) {
    const [content, setContent] = useState(props.content)
    const [isEdit, setIsEdit] = useState(true)

    return (
        <div>
            <div style={{ width: `${props.width}px`, height: `${props.height}px` }}>
                {isEdit ? (
                    <EditorCore
                        content={content}
                        setContent={setContent}
                        height={`${props.height}px`}
                        width={`${props.height}px`} />
                ) : (
                    <Render
                        className="viewer__portfolio"
                        content={content} />
                )}
            </div>
            <div className="viewer__editor-tab"
                style={{ top: `-${props.height + 50}px` }}>
                <div onClick={() => setIsEdit(true)}
                    className={classnames({
                        "viewer__tab-switch": true,
                        "viewer__tab-switch--100": true,
                        "viewer__tab-switch--select": isEdit
                    })} >
                    編集
                </div>
                <div onClick={() => setIsEdit(false)}
                    className={classnames({
                        "viewer__tab-switch": true,
                        "viewer__tab-switch--100": true,
                        "viewer__tab-switch--select": !isEdit
                    })} >
                    確認
                </div>
                <div className="viewer__onedit">
                    <div
                        onClick={() => props.onChange(content)}
                        className="btn-flat">編集完了</div>
                </div>
            </div>
        </div>
    )
}

// マークダウンエディタ
// ACEをラップしたようなコンポーネント
// 親コンポーネント: note.Editor
interface EditorCoreProps {
    content?: string
    setContent: Function
    className?: string
    height?: string
    width?: string
}
export function EditorCore(props: EditorCoreProps) {
    const [selector, setSelector] = useState(0)

    function onChange(value: string | undefined, e: any) {
        props.setContent(value)
    }

    function onCursorChange(e: any) {
        setSelector(e.cursor.row)
    }

    function onDrop(asset_id: string, tpe: string) {
        let value = ""
        props.content?.split("\n").forEach((line, i) => {
            value += line + "\n"
            if (i === selector) value += `@import-${tpe}{"id": "${asset_id}"}\n`
        })
        props.setContent(value.slice(0, -1))
    }

    return (
        <Dropzone className="editor__editor" onDrop={onDrop}>
            <AceEditor
                width={props.width ? props.width : "100%"}
                height={props.height ? props.height : "calc(100vh - 100px)"}
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
                value={props.content}
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


// マークダウンエディタにファイルをドラッグすると表示される
// 親コンポーネント: note.Editor
interface DropzoneProps {
    children?: React.ReactNode
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


export async function convertImg(base64: string): Promise<string> {
    const canvas = document.createElement("canvas");
    if (base64.match(/^data: image\/jpeg;base64,/)) {
        return new Promise<string>(resolve => { resolve(base64) })
    }
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const newImg = new Image()
        newImg.src = base64;
        newImg.onload = () => resolve(newImg);
        newImg.onerror = (e) => reject(e);
    })
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg");
}