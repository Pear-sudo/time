import React, {JSX} from "react";
import {YearHint} from "@/app/elements/YearHint";
import {Theme} from "@/app/theme";
import {generatePaddedMonth, getDayId} from "@/app/utility/timeUtil";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {DisplayContextObj} from "@/app/model/displayContextObj";

export function MonthlyCalendar(prop: { focus: Date, parentData?: DataWrapper<Date | undefined>, selfHider?:  React.Dispatch<React.SetStateAction<boolean>>}): JSX.Element {
    const dates: Date[] = generatePaddedMonth(prop.focus)

    function generateHandleOnDateClick(date: Date): () => void {
        return (
            function () {
                prop.parentData?.setData(date)
                const onDayCountOrAnchorChange = new DisplayContextObj().onDayCountOrAnchorChange
                if (onDayCountOrAnchorChange) {
                    onDayCountOrAnchorChange(undefined, date)
                }
                if (prop.selfHider) {
                    prop.selfHider(false)
                }
            }
        )
    }

    const weekDayNameSlots: JSX.Element[] = dates.slice(0, 7).map((date) => {
        const text = new Intl.DateTimeFormat("en-US", {weekday: 'narrow'}).format(date)
        return (
            <CircledSlot text={text} key={getDayId(date) + text}/>
        )
    })
    const dateSlots: JSX.Element[] = dates.map((date) => {
        return (
            <CircledSlot text={date.getDate().toString()} key={getDayId(date)} handleOnClick={generateHandleOnDateClick(date)}/>
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

function CircledSlot(prop: { text: string, hint?: string, handleOnClick?: () => void }): JSX.Element {
    return (
        <button className={`w-fit ${Theme.button}`} onClick={prop.handleOnClick}>
            {prop.text}
        </button>
    )
}