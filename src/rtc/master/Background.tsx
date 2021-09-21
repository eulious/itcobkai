import React, { ChangeEvent, useEffect, useRef, useState } from "react";

// 現在未使用、削除予定
export default function Background() {
    const ref = useRef<HTMLCanvasElement>(null)
    const [gridNum, setGridNum] = useState(16)

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        if (isNaN(Number(e.target.value))) return
        setGridNum(Number(e.target.value))
    }

    function onChecked() { }

    function onClick() {
        make(ref.current!);
        const link = document.createElement("a");
        link.href = ref.current!.toDataURL("image/png");
        link.download = "back.png";
        link.click();
    }

    function make(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d')!;
        ctx.strokeStyle = '#000';
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let grid = canvas.width / gridNum;
        for (let i = 0; i <= canvas.height / grid; ++i) {
            ctx.beginPath();
            ctx.moveTo(0, grid * i);
            ctx.lineTo(canvas.width, grid * i);
            ctx.closePath();
            ctx.stroke();
        }
        for (let i = 0; i <= canvas.width / grid; ++i) {
            ctx.beginPath();
            ctx.moveTo(grid * i, 0);
            ctx.lineTo(grid * i, canvas.height);
            ctx.closePath();
            ctx.stroke();
        }
    }

    useEffect(() => {
    })

    return (
        <div>
            <canvas ref={ref} style={{ display: "none" }} width="2000px" height="2000px"></canvas>
            <input type="text" value={gridNum} onChange={onChange} />
            <div className="btn-flat" onClick={onClick}>生成</div>
        </div>
    )
}