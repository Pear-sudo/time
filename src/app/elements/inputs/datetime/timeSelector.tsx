import React, {JSX, useRef, useState} from "react";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {deg2Time} from "@/app/utility/timeUtil";
import {getDistance} from "@/app/utility/domUtil";
import {genNums} from "@/app/utility/lanUtil";
import {NumericTimeSelector} from "@/app/elements/inputs/datetime/numericTimeSelector";

export function TimeSelector(prop: {
    default?: Date,
    parentData?: DataWrapper<Date> | DataWrapper<Date | undefined>
}): JSX.Element {
    const [armRotation, setArmRotation] = useState(-90)
    const [armRadius, setArmRadius] = useState(100)
    const [isSelectingHour, setIsSelectingHour] = useState(true)

    const centerRef = useRef<HTMLDivElement>(null);
    const armRef = useRef<HTMLDivElement>(null);
    const outerNumberRef = useRef<HTMLDivElement>(null);
    const innerNumberRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef<Date>(prop.default ? prop.default : new Date());
    const isLockedRef = useRef(false);

    const outerNumbers = circledElements({
        numbers: isSelectingHour ? [...Array(12).keys()] : genNums({from: 0, count: 12, step: 5}),
        ref: outerNumberRef
    })
    const innerNumbers: JSX.Element[] | undefined = isSelectingHour ? circledElements({
        numbers: [...Array.from({length: 12},
            (_, i) => i + 12)],
        radius: 70,
        ref: innerNumberRef
    }) : undefined

    function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (isLockedRef.current) {
            return
        }
        const center = centerRef.current
        const outer = outerNumberRef.current
        const inner = innerNumberRef.current
        if (center && outer && (inner || !isSelectingHour)) {
            const rect = center.getBoundingClientRect()
            const ox = rect.left
            const oy = rect.top

            const x = e.clientX
            const y = e.clientY

            const dx = x - ox
            const dy = -(y - oy) // y is positive in browser coordination system

            let radius = Math.sqrt(dx ** 2 + dy ** 2)

            const rad = Math.atan2(dy, dx)
            const deg = rad / Math.PI * 180

            // const innerR = getDistance(ox, oy, inner, {x: 'middle', y: 'end'})
            const outerR = getDistance(ox, oy, outer, {x: 'middle', y: 'end'})
            // console.log(`Inner radius: ${innerR}`)
            // console.log(`Outer radius: ${outerR}`)

            const time = timeRef.current
            if (isSelectingHour) {
                if (inner && radius <= outerR) {
                    radius = getDistance(ox, oy, inner, {x: 'middle', y: 'middle'})
                    time.setHours(deg2Time(-armRotation, 'hourPM'))
                } else {
                    radius = getDistance(ox, oy, outer, {x: 'middle', y: 'middle'})
                    time.setHours(deg2Time(-armRotation, 'hourAM'))
                }
            } else {
                radius = getDistance(ox, oy, outer, {x: 'middle', y: 'middle'})
                time.setMinutes(deg2Time(-armRotation, 'minute'))
            }

            setArmRotation(-deg)
            setArmRadius(radius)
            // console.log(dx + ', ' + dy)
            // console.log(deg)
            // console.log(radius)
        }
    }

    function onClick() {
        if (isLockedRef.current) {
            // the user decides to select the time again
            isLockedRef.current = false
            setIsSelectingHour(!isSelectingHour)
            return
        }
        if (!isLockedRef.current && !isSelectingHour) {
            // time selection is finished
            isLockedRef.current = true
            pass2Parent()
            return;
        }
        setIsSelectingHour(!isSelectingHour)
    }

    function pass2Parent() {
        if (prop.parentData) {
            prop.parentData.setData(timeRef.current)
        }
    }

    return (
        <div>
            <NumericTimeSelector
                default={timeRef.current}
                parentData={prop.parentData}
            />
            <div className={'rounded-full bg-gray-300 w-52 h-52 flex justify-center items-center relative'}
                 onMouseMove={onMouseMove} onClick={onClick}>
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

function circledElements(op: {
    numbers: number[],
    radius?: number,
    onClick?: ((n: number) => void)[],
    ref?: React.RefObject<HTMLDivElement>
}) {

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

    return op.numbers.map((n, index, array) => {
        const rotation = 360 / array.length * index
        return (
            <div style={{
                transform: `rotate(${rotation}deg) translate(1px, -${op.radius}px) rotate(-${rotation}deg)`,
                transformOrigin: '0 0',
                zIndex: '1'
            }} key={n} className={`absolute`} onClick={op.onClick ? generateOnClick(n, index) : undefined}
                 ref={index == 0 && op.ref ? op.ref : undefined}>
                {n}
            </div>
        )
    })
}