import React, {JSX, useContext, useEffect, useState} from "react";
import {DisplayContext} from "@/app/utility/windowManager";
import {Subscription} from "rxjs";
import {DaysBody} from "@/app/elements/daysBody";

export function Calendar(prop: {
    dates: Date[],
    renderDates: Date[]
    overScrollPercentage?: number
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


    let overScrollPercentage = prop.overScrollPercentage ? prop.overScrollPercentage : -3

    return (
        <div className={'flex-col flex w-full h-full'}>
            <DaysBody dates={prop.dates} renderDates={prop.renderDates} overScrollPercentage={overScrollPercentage}
                      events={prop.events}/>
        </div>
    )
}