import React, {JSX} from "react";
import {getWeek} from "@/app/utility/timeUtil";

export function WeekNumber(prop: {
    date: Date
}): JSX.Element {
    return (
        <div className={'text-black rounded bg-gray-400 py-1 px-2 select-none text-sm'}>
            {getWeek(prop.date)}
        </div>
    )
}