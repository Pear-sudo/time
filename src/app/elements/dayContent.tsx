import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import {areSameDate, getDayId, getRatioOfDay, isToday} from "@/app/utility/timeUtil";
import {isUN} from "@/app/utility/lanUtil";
import {getElementHeight, repeatElements} from "@/app/utility/domUtil";
import {Slot} from "@/app/elements/slot";
import {isTail} from "@/app/utility/numberUtil";
import {CurrentTimeLine} from "@/app/elements/currentTimeLine";
import {DisplayContext} from "@/app/pages/display";
import {CalendarEvent} from "@/app/model/eventData";

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
    const {displayContextObj, updateContext} = useContext(DisplayContext)
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
    useEffect(() => {

    });

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

    function getEventHeight(event: CalendarEvent): number | undefined {
        const begin = event.begin
        const end = event.end
        if (begin && end) {
            if (begin.valueOf() >= end.valueOf()) {
                console.log(begin)
                console.log(end)
                throw new Error("end is earlier than begin")
            }

            const beginRatio = areSameDate(prop.date, begin) ? getRatioOfDay(begin) : 0
            const endRatio = areSameDate(prop.date, end) ? getRatioOfDay(end) : 1
            const ratioDelta = endRatio - beginRatio

            if (ratioDelta > 0) {
                return ratioDelta * 100
            } else {
                throw new Error("ratio delta <= 0")
            }
        } else {
            console.log('begin || end not found')
        }
    }

    function getElementTop(event: CalendarEvent): number | undefined {
        if (event.begin) {
            const begin = event.begin
            if (areSameDate(begin, prop.date)) {
                return getRatioOfDay(begin) * 100
            } else {
                return 0
            }
        }
    }

    function events2elements(events: CalendarEvent[]): JSX.Element[] {
        const elements: JSX.Element[] = []
        for (const event of events) {
            const height = getEventHeight(event)
            const topP = getElementTop(event)
            const element: JSX.Element = (
                <div className={'absolute w-full bg-blue-600'} style={{height: `${height}%`, top: `${topP}%`}}>
                </div>
            )
            elements.push(element)
        }
        return elements
    }

    let eventElements: JSX.Element[] = []
    const events = displayContextObj.dataStore.getEvents(prop.date)
    if (events.length > 0) {
        eventElements = events2elements(events)
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
            {eventElements}
        </div>
    )
}