import {JSX} from "react";

export function TimeSelector(prop: {}): JSX.Element {
    const numbers = [...Array(12).keys()].map(n => {
        const rotation = 30 * n
        return (
            <div style={{
                transform: `rotate(${rotation}deg) translate(1px, -100px) rotate(-${rotation}deg)`,
                transformOrigin: '0 0'
            }} key={n} className={'absolute'}>
                {n}
            </div>
        )
    })
    return (
        <div>
            <div className={'rounded-full bg-gray-300 w-52 h-52 flex justify-center items-center relative'}>
                {numbers}
            </div>
        </div>
    )
}