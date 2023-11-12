import React, {JSX} from "react";
import {getWeekDay, isToday} from "@/app/utility/timeUtil";

export function DayNumber(prop: {
    date: Date,
    isInView: boolean
    children?: React.ReactNode
}): JSX.Element {
    return (
        <div className={`inline-flex flex-col items-center m-1 select-none w-full text-xs font-medium`}>
            <div className={`${isToday(prop.date) ? 'text-sky-700' : ''}`}>
                {getWeekDay(prop.date)}
            </div>
            <div
                className={`${isToday(prop.date) ? 'rounded-full text-white bg-sky-700' : ''} h-4 w-4 p-2 box-content text-center leading-4 relative text-sm font-semibold`}>
                {prop.children ? '' : prop.date.getDate()}
                <div className={'absolute visible'}>{prop.children}</div>
            </div>
        </div>
    )
}