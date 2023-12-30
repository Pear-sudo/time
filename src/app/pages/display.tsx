"use client"

import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import '../index.css';
import {throttle} from "lodash";
import {YearHint} from "@/app/elements/yearHint";
import {generateDates, generateFullWeekDays, rollDates} from "@/app/utility/timeUtil";
import {ControlButton} from "@/app/elements/ControlButton";
import {DayCount} from "@/app/elements/dayCount";
import {TextButton} from "@/app/elements/ui/buttons/textButton";
import {NavigationButtons} from "@/app/elements/ui/navigationButtons";
import {Calendar} from "@/app/elements/calendar";
import {Scheduler} from "@/app/utility/scheduler";
import {CalendarEventExt} from "@/app/model/eventData";
import {DisplayContextObj} from "@/app/model/displayContextObj";
import {Theme} from "@/app/theme";
import {DisplayContext} from "@/app/utility/windowManager";
import {Subscription} from "rxjs";
import {DaysHeader} from "@/app/elements/daysHeader";

export function Display(): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const [displayedDates, _updateDisplayedDates] = useState(generateFullWeekDays(new Date()))
    const displayedDatesRef = useRef(generateFullWeekDays(new Date()));
    const selfEvents = useRef({
        onTodayButtonClick: false
    });
    const selfRef = useRef<HTMLDivElement>(null);
    const [changeHeaderBg, updateChangeHeaderBg,] = useState(false)

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
        const headerBgSubscription: Subscription = displayContextObj.headerBg$.subscribe(updateChangeHeaderBg)

        return () => {
            headerBgSubscription.unsubscribe()
        }
        // the deps below is necessary
    }, [displayContextObj]);

    useEffect(() => {
        // updateHeight()
    });

    const displayContext = new DisplayContextObj()

    const scheduler = new Scheduler()
    const rerenderTask: { date: Date, f: Function } = {
        date: new Date(new Date().setHours(23, 59, 59, 999)),
        f: taskRerender
    }

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
        onDayCountOrAnchorChange(getDisplayedDates().length, new Date())
        selfEvents.current.onTodayButtonClick = !selfEvents.current.onTodayButtonClick
    }

    const onDayCountOrAnchorChange = (count?: number, anchor?: Date): void => {
        const currentDisplayedDates = getDisplayedDates()
        count = count ? count : currentDisplayedDates.length
        anchor = anchor ? anchor : currentDisplayedDates[0]
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
        onDayCountOrAnchorChange(getDisplayedDates().length)
    }

    function getRenderDates(dates: Date[]): Date[] {
        return [...rollDates(dates, -1), ...dates, ...rollDates(dates, 1)]
    }

    displayContext.onDayCountOrAnchorChange = onDayCountOrAnchorChange

    const renderDates = getRenderDates(displayedDates)

    let overScrollPercentage: number = -3 //-5
    if (displayedDates.length === 1) {
        overScrollPercentage = -0.5
    }

    return (
        // the two overflow-y-hidden below have to be configured in that way; otherwise, either you won't be able to scroll or the drop-down menu is incomplete; why?
        <div className={'w-full relative overflow-y-hidden'}
             style={{display: 'grid', gridTemplateRows: 'auto 1fr', height: '100dvh', gridTemplateColumns: '100%'}}
             ref={selfRef}>
            <div className={`transition-colors ${changeHeaderBg ? Theme.headerBgScrolled : ''}`}>
                <div
                    className={`w-full inline-flex flex-row justify-center items-center`}>
                    <div className={'flex-grow'}/>
                    <DayCount onChange={onDayCountOrAnchorChange}/>
                    <TextButton onClick={onTodayButtonClick} text={'Today'}/>
                    <NavigationButtons onClick={onNavigationButtonClick}/>
                    <div className={'flex-grow'}>
                        <YearHint dates={getDisplayedDates()} clickable={true}/>
                    </div>
                </div>
                <DaysHeader dates={getDisplayedDates()} renderDates={renderDates}
                            overScrollPercentage={overScrollPercentage}/>
            </div>
            <div className={'overflow-y-hidden'}>
                <Calendar dates={getDisplayedDates()} events={{scrollToNow: selfEvents.current.onTodayButtonClick}}
                          overScrollPercentage={overScrollPercentage} renderDates={renderDates}/>
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
