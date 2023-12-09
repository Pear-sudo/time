"use client"

import React, {JSX, useEffect, useRef, useState} from "react";
import '../index.css';
import {throttle} from "lodash";
import {YearHint} from "@/app/elements/YearHint";
import {generateDates, generateFullWeekDays, rollDates} from "@/app/utility/timeUtil";
import {ControlButton} from "@/app/elements/ControlButton";
import {DayCount} from "@/app/elements/dayCount";
import {TodayButton} from "@/app/elements/todayButton";
import {NavigationButtons} from "@/app/elements/navigationButtons";
import {DisplayContextObj} from "@/app/model/displayContextObj";
import {Calendar} from "@/app/elements/calendar";
import {Scheduler} from "@/app/utility/scheduler";
import {CalendarEventExt} from "@/app/model/eventData";

// @ts-ignore
export const DisplayContext = React.createContext<{ displayContextObj: DisplayContextObj, updateContext: React.Dispatch<React.SetStateAction<DisplayContextObj>> } >(undefined)

export function Display(): JSX.Element {
    const [displayedDates, _updateDisplayedDates] = useState(generateFullWeekDays(new Date()))
    const displayedDatesRef = useRef(generateFullWeekDays(new Date()));
    const selfEvents = useRef({
        onTodayButtonClick: false
    });
    const selfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.addEventListener('resize', handleResizeThrottled)
        window.addEventListener('visibilitychange', handleVisibilityChange)
        scheduler.registerTasks(tasks)

        return () => {
            console.log('Cleaning up hooks...')
            window.removeEventListener('resize', handleResizeThrottled)
            window.removeEventListener('visibilitychange', handleVisibilityChange)
            scheduler.removeAllTasks()
        }
    }, []);

    useEffect(() => {

    }, []);

    useEffect(() => {
        // updateHeight()
    });

    const scheduler = new Scheduler()
    const rerenderTask: { date: Date, f: Function } = {date: new Date(new Date().setHours(23, 59, 59, 999)), f: taskRerender}

    const tasks: { date: Date, f: Function }[] = [
        rerenderTask
    ]

    function updateHeight(): void {
        const selfDiv = selfRef.current
        if (selfDiv) {
            const windowHeight = window.innerHeight
            let targetHeight = windowHeight
            selfDiv.style.height = targetHeight + 'px'
        }
    }

    function handleVisibilityChange(): void {
        // This can also be used to detect the lock of screen
        // this cannot detect docking to the left sidebar (macOS)
        const isVisible: boolean = document.visibilityState === 'visible'
        console.log('Visible: ' + isVisible + ' at ' + new Date().toLocaleString())
        if (isVisible) {
            // don't waste computing power if it is not visible; and the timer is not accurate at that state anyway.
            taskRerender()
        }
    }

    function handleResize() {
        refreshUI()
    }

    const handleResizeThrottled = throttle(handleResize, 100)

    function updateDisplayedDates(dates: Date[]) {
        _updateDisplayedDates(dates)
        displayedDatesRef.current = dates
    }

    function getDisplayedDates(): Date[] {
        return displayedDatesRef.current
    }

    function taskRerender() {
        // we need to ensure the timeline is on the next day (cross day problem)
        refreshUI()
        console.log(`UI updated automatically at ${new Date().toLocaleString()}`)
        scheduler.removeTaskByFunction(rerenderTask.f)
        scheduler.registerTasks(rerenderTask)
    }

    const onNavigationButtonClick = (nextPeriod: boolean): void => {
        const count = nextPeriod ? 1 : -1
        const newDisplayedDates = rollDates(getDisplayedDates(), count)
        updateDisplayedDates(newDisplayedDates) // note that you cannot see the change immediately
    }

    const onTodayButtonClick = (): void => {
        onDayCountChange(getDisplayedDates().length, new Date())
        selfEvents.current.onTodayButtonClick = !selfEvents.current.onTodayButtonClick
    }

    const onDayCountChange = (count: number, anchor?: Date): void => {
        anchor = anchor ? anchor : getDisplayedDates()[0]
        switch (count) {
            case 7:
                updateDisplayedDates(generateFullWeekDays(anchor))
                break
            default:
                const days = generateDates(anchor, count)
                updateDisplayedDates(days)
        }
    }

    const refreshUI = (): void => {
        onDayCountChange(getDisplayedDates().length)
    }

    return (
        <div className={'w-full relative'} style={{display: 'grid', gridTemplateRows: 'auto 1fr', height: '100dvh'}}
             ref={selfRef}>
            <div className={'inline-flex flex-row justify-center'}>
                <DayCount onChange={onDayCountChange}/>
                <TodayButton onClick={onTodayButtonClick}/>
                <NavigationButtons onClick={onNavigationButtonClick}/>
                <YearHint dates={displayedDates}/>
            </div>
            <div className={'mx-8 overflow-y-hidden'}>
                <Calendar dates={displayedDates} events={{scrollToNow: selfEvents.current.onTodayButtonClick}}/>
            </div>
            <ControlButton/>
        </div>
)
}

function isMobileDevice() {
    return (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function SideBar(): JSX.Element {
    return (
        <div>

        </div>
    )
}

function Record(prop: { calendarEvent: CalendarEventExt, height: number, color: string }): JSX.Element {
    const calendarEvent = prop.calendarEvent
    return (
        <div className={'w-full'} style={{height: `${prop.height}px`, color: prop.color}}>
            <div className={'font-bold'}>{calendarEvent.title}</div>
            <div>{calendarEvent.description}</div>
        </div>
    )
}

// @ts-ignore
class CDate extends Date {
    constructor(...args: any[]) {
        // @ts-ignore
        super(...args)
        if (args.length === 0) {
            this.setHours(1)
        }
    }
}

export default function Layout(): JSX.Element {
    if (testing) {
        // @ts-ignore
        global.Date = CDate
    }
    return (
        <div className={'flex-row inline-flex justify-center w-full'}>
            <Display/>
        </div>
    )
}

const testing = false
