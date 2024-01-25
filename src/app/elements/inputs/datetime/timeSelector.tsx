import {JSX} from "react";
import {Theme} from "@/app/theme";

export function TimeSelector(prop: {}): JSX.Element {
    const outerNumbers = circledElements({numbers: [...Array(12).keys()], onClick: new Array(12).fill(onNumberClick)})
    const innerNumbers = circledElements({
        numbers: [...Array.from({length: 12},
            (_, i) => i + 12)],
        radius: 70,
        onClick: new Array(12).fill(onNumberClick)
    })

    function onNumberClick(n: number) {
        console.log(n)
    }

    return (
        <div>
            <div className={'rounded-full bg-gray-300 w-52 h-52 flex justify-center items-center relative'}>
                {outerNumbers}
                {innerNumbers}
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