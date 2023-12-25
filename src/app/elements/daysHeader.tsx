import React, {JSX} from "react";
import {Theme} from "@/app/theme";
import {TimeAxisUnit} from "@/app/elements/timeAxis";
import {getDayId, hour2String} from "@/app/utility/timeUtil";
import {WeekNumber} from "@/app/elements/weekNumber";
import {Pager} from "@/app/elements/ui/pager";
import {DayNumber} from "@/app/elements/dayNumber";

export function DaysHeader(prop: {
    dates: Date[],
    renderDates: Date[],
    overScrollPercentage: number
}): JSX.Element {
    function mapDate2DayNumber(date: Date, index: number, array: Date[], isInView: boolean): JSX.Element {
        return (
            <DayNumber date={date} isInView={isInView}/>
        )
    }

    return (
        <div
            className={`px-8 flex-row flex align-top grow-0 ${Theme.transition}`}>
            <div className={'invisible relative'}>
                <div className={`${Theme.timeAxisAddonStyle}`}>
                    {<TimeAxisUnit time={hour2String(23)}/>}
                </div>
                <div className={'absolute visible top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}>
                    <WeekNumber date={prop.dates.at(0) as Date}/>
                </div>
            </div>
            <Pager dataSet={prop.renderDates} scrollIndex={prop.dates.length} view={prop.dates.length}
                   mapData={mapDate2DayNumber}
                   hashData={getDayId} overScrollPercentage={prop.overScrollPercentage}/>
        </div>
    )
}