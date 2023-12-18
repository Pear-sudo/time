import React, {JSX} from "react";
import {Theme} from "@/app/theme";

export function YearHint(prop: {
    dates: Date[],
    clickable?: boolean
}): JSX.Element {
    let hint: string = ''

    const firstDate = prop.dates[0]
    const lastDate = prop.dates[prop.dates.length - 1]

    const firstYearStr = new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(firstDate)
    const lastYearStr = new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(lastDate)
    const firstMonthStrS = new Intl.DateTimeFormat("en-US", {month: 'short'}).format(firstDate)
    const lastMonthStrS = new Intl.DateTimeFormat("en-US", {month: 'short'}).format(lastDate)
    const firstMonthStrL = new Intl.DateTimeFormat("en-US", {month: 'long'}).format(firstDate)

    if (firstDate.getFullYear() === lastDate.getFullYear()) {
        if (firstDate.getMonth() !== lastDate.getMonth()) {
            hint = firstMonthStrS + ' - ' + lastMonthStrS + ' ' + firstYearStr
        } else {
            hint = firstMonthStrL + ' ' + firstYearStr
        }
    } else {
        hint = firstMonthStrS + ' ' + firstYearStr + ' - ' + lastMonthStrS + ' ' + lastYearStr
    }

    const buttonView: JSX.Element = (
        <button className={`h-full ${Theme.button}`}>
            {hint}
        </button>
    )

    const normalView: JSX.Element = (
        <div className={`h-full`}>
            {hint}
        </div>
    )

    return (
        <div>
            {prop.clickable ? buttonView : normalView}
        </div>
    )
}