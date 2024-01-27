import React, {JSX, useRef, useState} from "react";
import {Theme} from "@/app/theme";

export function TimeSelector(prop: {}): JSX.Element {
    const [armRotation, setArmRotation] = useState(-90)
    const armRef = useRef<HTMLDivElement>(null);
    const outerNumbers = circledElements({
        numbers: [...Array(12).keys()],
        onClick: new Array(12).fill(onNumberClick)
    })
    const innerNumbers = circledElements({
        numbers: [...Array.from({length: 12},
            (_, i) => i + 12)],
        radius: 70,
        onClick: new Array(12).fill(onNumberClick)
    })

    function onNumberClick(n: number) {
        console.log(n)
    }

    function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const arm = armRef.current
        if (arm) {
            const rect = arm.getBoundingClientRect()
            const ox = rect.left
            const oy = rect.right

            const x = e.clientX
            const y = e.clientY

            const dx = x - ox
            const dy = -(y - oy) // y is positive in browser coordination system

            const rad = Math.atan2(dy, dx)
            const deg = rad / Math.PI * 180
            setArmRotation(-deg)
            console.log(-deg)
        }
    }

    return (
        <div>
            <div className={'rounded-full bg-gray-300 w-52 h-52 flex justify-center items-center relative'}
                 onMouseMove={onMouseMove}>
                {outerNumbers}
                {innerNumbers}
                <div className={'h-1.5 bg-blue-500'}
                     ref={armRef}
                     style={{
                         width: '100px',
                         transformOrigin: '0 0',
                         transform: `translate(50px) rotate(${armRotation}deg)`
                     }}>
                </div>
            </div>
        </div>
    )
}

function circledElements(op: { numbers: number[], radius?: number, onClick?: ((n: number) => void)[] }) {

    if (op.onClick && op.numbers.length != op.onClick.length) {
        throw new Error(`elements length (${op.numbers.length}) 
        does not match onclick functions length (${op.onClick.length})`)
    }
    op.radius = op.radius ?? 100

    function generateOnClick(element: number, index: number) {
        if (!op.onClick) {
            return
        }
        const fs = op.onClick
        if (fs) {
            return (
                () => {
                    const f = fs.at(index)
                    if (f) {
                        f(element)
                    }
                }
            )
        }
    }

    return op.numbers.map((n, index) => {
        const rotation = 30 * index
        return (
            <div style={{
                transform: `rotate(${rotation}deg) translate(1px, -${op.radius}px) rotate(-${rotation}deg)`,
                transformOrigin: '0 0'
            }} key={n} className={`absolute ${Theme.button}`} onClick={generateOnClick(n, index)}>
                {n}
            </div>
        )
    })
}