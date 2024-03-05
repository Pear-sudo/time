import React, {JSX, useEffect, useRef, useState} from "react";
import {DataWrapper, StateClass} from "@/app/elements/inputs/helper/inputHelper";
import {deg2Time, set2SameDate, time2Deg} from "@/app/utility/timeUtil";
import {getDistance} from "@/app/utility/domUtil";
import {genNums} from "@/app/utility/lanUtil";
import {NumericTimeSelector} from "@/app/elements/inputs/datetime/numericTimeSelector";
import {Theme} from "@/app/theme";
import {WindowController, WindowManager} from "@/app/utility/windowManager";
import {TimeDisplay} from "@/app/elements/presentation/timeDisplay";

export function TimeSelector(prop: {
    parentData: DataWrapper<Date>
}): JSX.Element {
    const [armRotation, setArmRotation] = useState(-90)
    const [armRadius, setArmRadius] = useState(100)
    const [isSelectingHour, setIsSelectingHour] = useState(true)

    const centerRef = useRef<HTMLDivElement>(null);
    const armRef = useRef<HTMLDivElement>(null);
    const outerNumberRef = useRef<HTMLDivElement>(null);
    const innerNumberRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef<Date>(new Date(prop.parentData.getData().valueOf()));
    const isLockedRef = useRef(false);

    useEffect(() => {
        const time = timeRef.current
        const hour = time.getHours()
        const minute = time.getMinutes()

        let r: number = 0
        let deg = 0
        let x: number = 0
        let y: number = 0

        if (isSelectingHour && hour >= 12) {
            r = 1
        } else {
            r = 1_000_000
        }

        if (isSelectingHour) {
            deg = time2Deg(hour, 'hourAM')
        } else {
            deg = time2Deg(minute, 'minute')
        }

        let rad = deg / 180 * Math.PI
        x = Math.cos(rad) * r
        y = Math.sin(rad) * r

        console.log('hour: ' + hour)
        console.log('rad: ' + rad)
        console.log('x: ' + x)
        onMove(0, 0, x, y)
    }, [isSelectingHour]);

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

    function onMove(clientX: number, clientY: number, _dx?: number, _dy?: number) {
        // _dx and _dy are for internal use only: to manually control the arm
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

            const x = clientX
            const y = clientY

            const dx = _dx ?? x - ox
            const dy = _dy ?? -(y - oy) // y is positive in browser coordination system

            let radius = Math.sqrt(dx ** 2 + dy ** 2)

            const rad = Math.atan2(dy, dx)
            const deg = rad / Math.PI * 180

            // const innerR = getDistance(ox, oy, inner, {x: 'middle', y: 'end'})
            const outerR = getDistance(ox, oy, outer, {x: 'middle', y: 'end'})
            // console.log(`Inner radius: ${innerR}`)
            // console.log(`Outer radius: ${outerR}`)

            const time = (_dy || _dx) ? new Date(timeRef.current.valueOf()) : timeRef.current
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

    function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        onMove(e.clientX, e.clientY)
    }

    function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
        const touch = e.touches[0]
        onMove(touch.clientX, touch.clientY)
    }

    function handleOnClockClick() {
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
        <div className={'flex flex-col items-center w-fit'}>
            <NumericTimeSelector
                default={timeRef.current}
                parentData={prop.parentData}
            />
            <div className={'rounded-full bg-gray-300 flex justify-center items-center relative'}
                 onMouseMove={onMouseMove} onClick={handleOnClockClick} onTouchMove={onTouchMove}
                 style={{width: '240px', height: '240px'}}
            >
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

export function WrappedTimeSelector(prop: {
    default?: Date,
    parentData?: DataWrapper<Date> | DataWrapper<Date | undefined>
}) {
    const [date, setDate] = useState<Date>(prop.default ? new Date(prop.default.valueOf()) : new Date());

    const wm = new WindowManager()
    const wKey: string = "timeSelector"
    let wController: WindowController

    function handleDidSet(newValue: Date, oldValue: Date) {
        // we cannot pass the parent data wrapper directly to the child element; instead, we create our own wrapper,
        // and intercept the data, do some additional work, then pass it back
        if (prop.parentData) {
            const reference = prop.parentData.getData()
            if (reference) {
                prop.parentData.setData(set2SameDate(reference, newValue))
            } else {
                console.log("You may notice something weird has happened, that's because I did not get the original date object for reference." +
                    "beginDTRef and etc relies on this!")
            }
        }
        // console.log("new value: " + newValue)
        // console.log("parent data: " + prop.parentData?.getData())
        wController.closeWindow()
    }

    function handleOnClick() {
        wController = wm.createWindow({
            view: <TimeSelector parentData={new StateClass(date, setDate, {didSet: handleDidSet})}/>,
            key: wKey,
            onWindowClose: handleOutsideClick,
            header: true,
            rounded: true
        })
    }

    function handleOutsideClick() {
        wController.closeWindow()
    }

    return (
        <span className={`${Theme.button}`} onClick={handleOnClick}>
            <TimeDisplay date={date}/>
        </span>
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