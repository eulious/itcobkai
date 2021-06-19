import React, { useRef } from "react";

interface ImgBoxProps {
    setValue: Function
    value: any
}

export default function ImgBox(props: ImgBoxProps) {
    const ref = useRef<HTMLCanvasElement>(null)

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const THUMBNAIL_MAX_WIDTH = 128;
        const THUMBNAIL_MAX_HEIGHT = 128;
        const file = e!.currentTarget!.files![0];
        if (file.type != 'image/jpeg' && file.type != 'image/png') {
            console.error("未対応のファイル形式です", false)
            return;
        }
        const image = new Image();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            image.src = e.target!.result as string;
            image.onload = function () {
                let width, height;
                if (image.width > image.height) {
                    const ratio = image.height / image.width;
                    width = THUMBNAIL_MAX_WIDTH;
                    height = THUMBNAIL_MAX_WIDTH * ratio;
                } else {
                    const ratio = image.width / image.height;
                    width = THUMBNAIL_MAX_HEIGHT * ratio;
                    height = THUMBNAIL_MAX_HEIGHT;
                }
                props.value.thumbnail = ""
                const canvas = ref.current!
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')!;
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
                props.value.base64 = canvas.toDataURL('image/jpeg');
                props.setValue({ ...props.value })
            }
        }
    }

    return (
        <div className="auth__form-item">
            アイコン画像（任意）
            <input type="file" accept="image/*" onChange={onChange} />
            <canvas ref={ref} width="0" height="0"></canvas>
            <img src={props.value.thumbnail ? `./assets/thumb/${props.value.thumbnail}.jpg` : ""} />
        </div>
    )
}