import React, {JSX} from "react";
import {YearHint} from "@/app/elements/YearHint";
import {Theme} from "@/app/theme";
import {generatePaddedMonth, getDayId} from "@/app/utility/timeUtil";

export function MonthlyCalendar(prop: {focus: Date}): JSX.Element {
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
        <div>
            <YearHint dates={[prop.focus]}/>
            <div className={'grid-cols-7 grid'}>
                {weekDayNameSlots}
                {dateSlots}
            </div>
        </div>
    )
}

function CircledSlot(prop: {text: string, hint?: string}): JSX.Element {
    return (
        <div>
            <button className={`rounded-full ${Theme.button}`}>
                {prop.text}
            </button>
        </div>
    )
}