import React, {JSX, useRef, useState} from "react";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {deg2Time} from "@/app/utility/timeUtil";

export function TimeSelector(prop: { parentData?: DataWrapper<Date> | DataWrapper<Date | undefined> }): JSX.Element {
    const [armRotation, setArmRotation] = useState(-90)
    const [armRadius, setArmRadius] = useState(100)
    const centerRef = useRef<HTMLDivElement>(null);
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
        const center = centerRef.current
        if (center) {
            const rect = center.getBoundingClientRect()
            const ox = rect.left
            const oy = rect.top

            const x = e.clientX
            const y = e.clientY

            const dx = x - ox
            const dy = -(y - oy) // y is positive in browser coordination system

            const radius = Math.sqrt(dx ** 2 + dy ** 2)

            const rad = Math.atan2(dy, dx)
            const deg = rad / Math.PI * 180

            setArmRotation(-deg)
            setArmRadius(radius)
            // console.log(dx + ', ' + dy)
            // console.log(deg)
            // console.log(radius)
        }
    }

    return (
        <div>
            <div>
                <NumberInSquare number={deg2Time(-armRotation, "hour")}/>
            </div>
            <div className={'rounded-full bg-gray-300 w-52 h-52 flex justify-center items-center relative'}
                 onMouseMove={onMouseMove}>
                {outerNumbers}
                {innerNumbers}
                <div className={'h-1.5 bg-blue-500'}
                     ref={armRef}
                     style={{
                         width: `${armRadius}px`,
                         transformOrigin: '0 50%',
                         transform: `translate(50%) rotate(${armRotation}deg)`
                     }}>
                </div>
                <div className={'absolute rounded-full w-5 h-5 bg-blue-500'}
                     style={{
                         transformOrigin: '50% 50%',
                         transform: `rotate(${armRotation}deg) translate(${armRadius}px)`
                     }}>
                </div>
                <div className={'h-px w-px absolute'} ref={centerRef}></div>
            </div>
        </div>
    )
}

function NumberInSquare(prop: { number: number }): JSX.Element {
    return (
        <div className={'rounded bg-gray-300'}>
            {prop.number}
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
                transformOrigin: '0 0',
                zIndex: '1'
            }} key={n} className={`absolute`} onClick={generateOnClick(n, index)}>
                {n}
            </div>
        )
    })
}