import React, {JSX, useContext, useEffect, useRef} from "react";
import {getRatioOfDay, isToday} from "@/app/utility/timeUtil";
import {isUN} from "@/app/utility/lanUtil";
import {getElementHeight, repeatElements} from "@/app/utility/domUtil";
import {Slot} from "@/app/elements/slot";
import {isTail} from "@/app/utility/numberUtil";
import {CurrentTimeLine} from "@/app/elements/currentTimeLine";
import {DisplayContext} from "@/app/pages/display";

export function DayContent(prop: {
    height: number,
    date: Date,
    index: {
        index: number,
        length: number
    },
    isInView: boolean
}): JSX.Element {
    const timeLineRef = useRef<HTMLDivElement>(null);
    const selfRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<NodeJS.Timeout>()
    const displayContextObj = useContext(DisplayContext)
    useEffect(() => {
        if (isToday(prop.date)) {
            updateTimeline()
            if (isUN(timerRef.current) && prop.isInView) {
                // in case it is scrolled in to invisible area and then scrolled back to the visible area without being removed from DOM in the whole process,
                // this is possible because a key is set and React would preserve them to save computing power.
                registerTimer()
            }
            if (!prop.isInView) {
                // in case it is scrolled to invisible area but is still in the DOM (useEffect with [] won't be called at this time)
                clearTimer()
            }
        }
    });
    useEffect(() => {
        // will be run when the element is mounted and unmounted
        if (isToday(prop.date) && prop.isInView && isUN(timerRef.current)) {
            registerTimer()
        }
        return clearTimer
    }, []);

    function registerTimer() {
        const interval = 60000 // update every 60 seconds
        timerRef.current = setInterval(updateTimeline, interval)
        // console.log('register')
    }

    function clearTimer() {
        if (!isUN(timerRef.current)) {
            clearInterval(timerRef.current)
            timerRef.current = undefined
            // console.log('unmount')
        }
    }

    function updateTimeline(): void {
        // We need to check the condition again in case it's 23:59 and the user does to trigger UI rerender
        if (isToday(prop.date)) {
            const ratio = getRatioOfDay(new Date())
            const percentage = ratio * 100

            const dayContentDiv = selfRef.current as HTMLDivElement
            const dayContentDivHeight = getElementHeight(dayContentDiv)

            const slotHeight = dayContentDivHeight / 24

            displayContextObj.timeLineTop = dayContentDivHeight * ratio
            displayContextObj.slotHeight = slotHeight

            // @ts-ignore
            timeLineRef.current.style.top = percentage.toString() + '%'
            // console.log(new Date())
        } else {
            // TODO trigger a layout rerender to inform other column to display the timeline
            clearTimer()
        }
    }

    let slots: JSX.Element[] = []
    slots = repeatElements(24, (index) => <Slot id={index}
                                                className={isTail(prop.index.index, prop.index.length) ? 'border-x' : 'border-l'}/>)

    const timeLine: JSX.Element =
        <div className={'absolute left-0 w-full'} style={{top: '0%'}} ref={timeLineRef}>
            <CurrentTimeLine/>
        </div>

    return (
        <div className={'relative'} style={{height: `${prop.height}vh`}} ref={selfRef}>
            {slots}
            {isToday(prop.date) ? timeLine : ''}
        </div>
    )
}