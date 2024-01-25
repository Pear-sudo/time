import {JSX} from "react";
import {Theme} from "@/app/theme";

export function TimeSelector(prop: {}): JSX.Element {
    const outerNumbers = circledElements({numbers: [...Array(12).keys()]})
    const innerNumbers = circledElements({
        numbers: [...Array.from({length: 12},
            (_, i) => i + 12)],
        radius: 70
    })
    return (
        <div>
            <div className={'rounded-full bg-gray-300 w-52 h-52 flex justify-center items-center relative'}>
                {outerNumbers}
                {innerNumbers}
            </div>
        </div>
    )
}

function circledElements(op: { numbers: number[], radius?: number }) {
    op.radius = op.radius ?? 100

    return op.numbers.map((n, index) => {
        const rotation = 30 * index
        return (
            <div style={{
                transform: `rotate(${rotation}deg) translate(1px, -${op.radius}px) rotate(-${rotation}deg)`,
                transformOrigin: '0 0'
            }} key={n} className={`absolute ${Theme.button}`}>
                {n}
            </div>
        )
    })
}