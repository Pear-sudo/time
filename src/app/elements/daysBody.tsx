import React, {JSX, useContext, useEffect, useRef} from "react";
import {TimeAxis} from "@/app/elements/timeAxis";
import {Pager} from "@/app/elements/ui/pager";
import {getDayId} from "@/app/utility/timeUtil";
import {throttle} from "lodash";
import {DisplayContext} from "@/app/utility/windowManager";
import {DayContent} from "@/app/elements/dayContent";
import {getElementHeight} from "@/app/utility/domUtil";

export function DaysBody(prop: {dates: Date[], renderDates: Date[], overScrollPercentage: number, events?: { scrollToNow: boolean }}): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const scrollableAreaRef = useRef<HTMLDivElement>(null)
    const refToChild = useRef({timeLineTop: 0})
    const prevProps = useRef(prop)
    useEffect(() => {
        prevProps.current = prop
    });
    useEffect(() => {
        scrollToTimeline()
    }, []);

    const height = 150

    const handleOnScroll = throttle((event: React.UIEvent<HTMLDivElement>): void => {
        const target = event.target as HTMLDivElement
        displayContextObj.scrolledY = target.scrollTop
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

    if (prevProps.current.events?.scrollToNow !== prop.events?.scrollToNow) {
        // today button is clicked
        scrollToTimeline()
    }
    // todo the first day in the view is not perfectly aligned, find a solution
    // todo when a day is clicked, switch to day view
    // todo support yearly view

    return (
        <div className={'px-8 flex-row inline-flex w-full overflow-y-auto grow'}
             onScroll={handleOnScroll} ref={scrollableAreaRef}>
            <div>
                <TimeAxis height={height}/>
            </div>
            <Pager dataSet={prop.renderDates} scrollIndex={prop.dates.length} view={prop.dates.length}
                   mapData={mapDate2DayContent}
                   hashData={getDayId} overScrollPercentage={prop.overScrollPercentage} parentRef={refToChild}/>
        </div>
    )
}