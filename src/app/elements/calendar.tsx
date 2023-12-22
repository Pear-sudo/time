import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import {throttle} from "lodash";
import {DayContent} from "@/app/elements/dayContent";
import {DayNumber} from "@/app/elements/dayNumber";
import {getDayId, hour2String, rollDates} from "@/app/utility/timeUtil";
import {getElementHeight} from "@/app/utility/domUtil";
import {Theme} from "@/app/theme";
import {TimeAxis, TimeAxisUnit} from "@/app/elements/timeAxis";
import {WeekNumber} from "@/app/elements/weekNumber";
import {Pager} from "@/app/elements/ui/pager";
import {DisplayContext} from "@/app/utility/windowManager";

export function Calendar(prop: {
    dates: Date[],
    events?: { scrollToNow: boolean }
}): JSX.Element {
    const [changeHeaderBg, updateChangeHeaderBg,] = useState(false)
    const scrollableAreaRef = useRef<HTMLDivElement>(null)
    const scrollBarVisible = useRef<boolean>(true)
    const prevProps = useRef(prop)
    const refToChild = useRef({timeLineTop: 0})
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    useEffect(() => {
        prevProps.current = prop
    });
    useEffect(() => {
        scrollToTimeline()
    }, []);

    const height = 150

    const handleOnScroll = throttle((event: React.UIEvent<HTMLDivElement>): void => {
        const target = event.target as HTMLDivElement
        const scrollTop = target.scrollTop
        displayContextObj.scrolledY = scrollTop
        updateChangeHeaderBg(scrollTop > 10)
    }, 200)

    function mapDate2DayContent(date: Date, index: number, array: Date[], isInView: boolean): JSX.Element {
        return (
            <DayContent date={date}
                        height={height}
                        index={{index: index, length: array.length}}
                        isInView={isInView}
            />
        )
    }

    function mapDate2DayNumber(date: Date, index: number, array: Date[], isInView: boolean): JSX.Element {
        return (
            <DayNumber date={date} isInView={isInView}/>
        )
    }

    function getRenderDates(dates: Date[]): Date[] {
        return [...rollDates(prop.dates, -1), ...dates, ...rollDates(prop.dates, 1)]
    }

    function scrollToTimeline() {
        if (scrollableAreaRef.current) {
            const scrollableAreaHeight = getElementHeight(scrollableAreaRef.current)
            const scrollableAreaHeightHalf = scrollableAreaHeight / 2
            const timeLineTop = displayContextObj.timeLineTop
            if (timeLineTop > scrollableAreaHeightHalf) {
                const top = timeLineTop - scrollableAreaHeightHalf
                // @ts-ignore
                scrollableAreaRef.current.scrollTo({top: top, left: scrollableAreaRef.current.scrollLeft, behavior: 'smooth'})
            } else {
                // in case the user is at the bottom
                const top = 0
                scrollableAreaRef.current.scrollTo({top: top, left: scrollableAreaRef.current.scrollLeft, behavior: 'smooth'})
            }
        }
    }

    const renderDates = getRenderDates(prop.dates)
    let overScrollPercentage: number = -3 //-5
    if (prop.dates.length === 1) {
        overScrollPercentage = -0.5
    }

    if (prevProps.current.events?.scrollToNow !== prop.events?.scrollToNow) {
        // today button is clicked
        scrollToTimeline()
    }

    return (
        <div className={'flex-col inline-flex w-full h-full'}>
            <div
                className={`px-8 flex-row inline-flex align-top grow-0 ${Theme.transition} ${changeHeaderBg ? Theme.headerBgScrolled : ''}`}>
                <div className={'invisible relative'}>
                    <div className={`${Theme.timeAxisAddonStyle}`}>
                        {<TimeAxisUnit time={hour2String(23)}/>}
                    </div>
                    <div className={'absolute visible top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}>
                        <WeekNumber date={prop.dates.at(0) as Date}/>
                    </div>
                </div>
                <Pager dataSet={renderDates} scrollIndex={prop.dates.length} view={prop.dates.length}
                       mapData={mapDate2DayNumber}
                       hashData={getDayId} overScrollPercentage={overScrollPercentage}/>
            </div>
            <div className={'px-8 flex-row inline-flex w-full overflow-y-auto grow'}
                 onScroll={handleOnScroll} ref={scrollableAreaRef}>
                <div>
                    <TimeAxis height={height}/>
                </div>
                <Pager dataSet={renderDates} scrollIndex={prop.dates.length} view={prop.dates.length}
                       mapData={mapDate2DayContent}
                       hashData={getDayId} overScrollPercentage={overScrollPercentage} parentRef={refToChild}/>
            </div>
        </div>
    )
}