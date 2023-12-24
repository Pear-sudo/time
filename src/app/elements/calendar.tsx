import React, {JSX, useContext, useEffect, useState} from "react";
import {rollDates} from "@/app/utility/timeUtil";
import {DisplayContext} from "@/app/utility/windowManager";
import {Subscription} from "rxjs";
import {DaysHeader} from "@/app/elements/daysHeader";
import {DaysBody} from "@/app/elements/daysBody";

export function Calendar(prop: {
    dates: Date[],
    events?: { scrollToNow: boolean }
}): JSX.Element {
    const [changeHeaderBg, updateChangeHeaderBg,] = useState(false)
    const {displayContextObj, updateContext} = useContext(DisplayContext)

    useEffect(() => {
        const headerBgSubscription: Subscription = displayContextObj.headerBg$.subscribe(updateChangeHeaderBg)

        return () => {
            headerBgSubscription.unsubscribe()
        }
    }, [displayContextObj]);

    function getRenderDates(dates: Date[]): Date[] {
        return [...rollDates(prop.dates, -1), ...dates, ...rollDates(prop.dates, 1)]
    }

    const renderDates = getRenderDates(prop.dates)
    let overScrollPercentage: number = -3 //-5
    if (prop.dates.length === 1) {
        overScrollPercentage = -0.5
    }

    return (
        <div className={'flex-col flex w-full h-full'}>
            <DaysHeader dates={prop.dates} renderDates={renderDates} changeHeaderBg={changeHeaderBg}
                        overScrollPercentage={overScrollPercentage}/>
            <DaysBody dates={prop.dates} renderDates={renderDates} overScrollPercentage={overScrollPercentage}
                      events={prop.events}/>
        </div>
    )
}