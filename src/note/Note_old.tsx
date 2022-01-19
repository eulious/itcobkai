import React, { useEffect, useRef, useState } from 'react';
import { getParam, useTransition } from '../common/Hooks';
import { Connection } from '../viewer/Connector';
import { Person } from '../viewer/Persons';
import Editor from './Editor';
import NoteViewer from './NoteViewer';

interface NoteProps {
    conn?: Connection
    player?: Person
}
export default function Note(props: NoteProps) {
    const param = getParam()
    const transition = useTransition()
    const [conntent, setContent] = useState("")

    function handleClose() {
        transition("rtc", true, false)
    }

    const isNote = param.mode === "note"
        && param.id
        && props.conn

    return isNote ? (
        <Modal handleClose={handleClose}>
            {param.edit ? (
                <Editor
                    content={conntent}
                    setContent={setContent} />
            ) : (
                <NoteViewer
                    player={props.player!}
                    content={conntent}
                    conn={props.conn!}
                />
            )}
        </Modal>
    ) : (<></>)
}


interface ModalProps {
    children: React.ReactNode
    handleClose: Function
}
function Modal(props: ModalProps) {
    const ref = useRef<HTMLDivElement>(null)

    function onClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target == ref.current) {
            props.handleClose()
        }
    }

    return (
        <div className="modal__wrapper"
            ref={ref}
            onClick={onClick}>
            <div className="modal__container">
                {props.children}
            </div>
        </div>
    )
}