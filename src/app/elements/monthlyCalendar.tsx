import React, {JSX} from "react";
import {YearHint} from "@/app/elements/YearHint";
import {Theme} from "@/app/theme";
import {generatePaddedMonth, getDayId} from "@/app/utility/timeUtil";

export function MonthlyCalendar(prop: { focus: Date }): JSX.Element {
    const dates: Date[] = generatePaddedMonth(prop.focus)
    const weekDayNameSlots: JSX.Element[] = dates.slice(0, 7).map((date) => {
        const text = new Intl.DateTimeFormat("en-US", {weekday: 'narrow'}).format(date)
        return (
            <CircledSlot text={text} key={getDayId(date) + text}/>
        )
    })
    const dateSlots: JSX.Element[] = dates.map((date) => {
        return (
            <CircledSlot text={date.getDate().toString()} key={getDayId(date)}/>
        )
    })
    return (
        <div className={'bg-cyan-50 p-2 w-fit'}>
            <YearHint dates={[prop.focus]} clickable={false}/>
            <div className={'grid-cols-7 grid gap-x-10 w-fit overflow-auto'}>
                {weekDayNameSlots}
                {dateSlots}
            </div>
        </div>
    )
}

function CircledSlot(prop: { text: string, hint?: string }): JSX.Element {
    return (
        <button className={`w-fit ${Theme.button}`}>
            {prop.text}
        </button>
    )
}