import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import {areSameDate, getRatioOfDay, isToday, percentage2Date, rollDate} from "@/app/utility/timeUtil";
import {isUN} from "@/app/utility/lanUtil";
import {getElementHeight, repeatElements} from "@/app/utility/domUtil";
import {Slot} from "@/app/elements/slot";
import {isTail} from "@/app/utility/numberUtil";
import {CurrentTimeLine} from "@/app/elements/currentTimeLine";
import {DisplayContext} from "@/app/utility/windowManager";
import {CalendarEvent, CalendarEventCounter} from "@/app/model/eventData";
import {Theme} from "@/app/theme";
import {Color} from "@/app/utility/color";
import {CalendarEventCreatorWrapper} from "@/app/elements/calendarEventCreator";

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
    const [calendarEventElements, setCalendarEventElements] = useState<JSX.Element[]>([])
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
        // to prevent Text content does not match server-rendered HTML error, see https://nextjs.org/docs/messages/react-hydration-error
        const events = displayContextObj.dataStore.getEvents(prop.date)

        if (events.length > 0) {
            setCalendarEventElements(events2elements(events))
        } else if (calendarEventElements.length > 0) {
            // only testing events.length > 0 is error-prone, because if the user deleted the only event of a day, it won't disappear :)
            setCalendarEventElements([])
        }

        // Don't naively think dataStore's reference won't be updated, remember when a calendar event is changed, the whole context will be recreated, including this dataStore.
    }, [prop.date, displayContextObj.dataStore]);

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
                console.log(beginRatio)
                console.log(endRatio)
                throw new Error("ratio delta <= 0")
            }
        } else {
            console.log('begin || end not found')
            console.log(event)
        }
    }

    function getEventTop(event: CalendarEvent): number | undefined {
        if (event.begin) {
            const begin = event.begin
            if (areSameDate(begin, prop.date)) {
                return getRatioOfDay(begin) * 100
            } else {
                return 0
            }
        }
    }

    function handleOnContextMenu(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault()
        // TODO Add a custom menu
    }

    function event2element(event: CalendarEvent, pending?: boolean, overlapCount?: number, order?: number): JSX.Element {
        const height = getEventHeight(event)
        const topP = getEventTop(event)
        let color = event.color ? event.color : Theme.defaultEventColor
        // the underlying data store cannot store Color object
        // TODO improve dataStore
        if (!(color instanceof Color)) {
            // @ts-ignore
            color = Color.setColor(color._colorName)
        }

        let width: string
        overlapCount = overlapCount ? overlapCount : 1
        width = 1 / overlapCount * 100 + "%"

        let left: string
        order = order ? order : 1
        left = (order - 1) / overlapCount * 100 + "%"

        return (
            <div className={'absolute overflow-auto overscroll-contain rounded'}
                 style={{
                     height: `${height}%`,
                     top: `${topP}%`,
                     left: left,
                     width: width,
                     backgroundColor: color.toCss()
                 }}
                 key={event.createTimestamp.valueOf()}
                 onContextMenu={handleOnContextMenu}
            >
                <div className={'text-center text-sm'}>{event.title}</div>
                <div className={'text-center text-xs'}>{event.location}</div>
                <div className={'text-center text-xs'}>{event.description}</div>
                <CalendarEventCreatorWrapper existingCE={event} pending={pending}/>
            </div>
        )
    }

    function events2elements(events: CalendarEvent[]): JSX.Element[] {
        const elements: JSX.Element[] = []
        const counter = new CalendarEventCounter()
        counter.processAll(events)
        for (const wrappedEvent of counter.wrappedEvents) {
            const element = event2element(wrappedEvent.calendarEvent, false, wrappedEvent.counter.count, wrappedEvent.order)
            elements.push(element)
        }
        return elements
    }

    function handleOnClick(event: React.MouseEvent) {
        if (selfRef.current) {
            const clickPointPageY = event.pageY
            const containerScrolledY = displayContextObj.scrolledY
            const containerPageY = window.scrollY + selfRef.current.offsetTop
            const topP = (clickPointPageY - containerPageY + containerScrolledY) / getElementHeight(selfRef.current)

            const clickDate = percentage2Date(prop.date, topP)
            const targetEnd = rollDate(clickDate, {hour: 1})
            calendarEventElements.push(event2element(new CalendarEvent({begin: clickDate, end: targetEnd}), true))

            // create a new copy, otherwise the UI won't be updated
            setCalendarEventElements(Array.from(calendarEventElements))
        }
        event.stopPropagation()
    }

    let slots: JSX.Element[] = []
    slots = repeatElements(24, (index) => <Slot id={index}
                                                className={isTail(prop.index.index, prop.index.length) ? 'border-x' : 'border-l'}
                                                key={index}/>)

    const timeLine: JSX.Element =
        <div className={'absolute left-0 w-full'} style={{top: '0%'}} ref={timeLineRef}>
            <CurrentTimeLine/>
        </div>

    return (
        <div className={'relative'} style={{height: `${prop.height}vh`}} ref={selfRef} onClick={handleOnClick}>
            {slots}
            {isToday(prop.date) ? timeLine : ''}
            {calendarEventElements}
        </div>
    )
}