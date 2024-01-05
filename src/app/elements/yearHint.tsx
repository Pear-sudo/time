import React, {JSX, useState} from "react";
import {Theme} from "@/app/theme";
import {Dropdown} from "@/app/elements/ui/dropdown";
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";
import {includeDate} from "@/app/utility/timeUtil";

export function YearHint(prop: {
    dates: Date[],
    clickable?: boolean
}): JSX.Element {
    const [showDropdown, setShowDropdown] = useState(false)
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

    function handleOnCancel() {
        setShowDropdown(false)
    }

    const buttonView: JSX.Element = (
        <Dropdown parent={
            <div className={`${Theme.button} w-fit`} onClick={handleOnClick}>
                {hint}
            </div>
        } child={
            <MonthlyCalendar anchor={includeDate(new Date(), prop.dates) ? new Date() : prop.dates[0]} selfHider={setShowDropdown} updateGlobalAnchor={true}/>
        } show={showDropdown} onCancel={handleOnCancel}/>
    )

    const normalView: JSX.Element = (
        <div className={`h-full select-none`}>
            {hint}
        </div>
    )

    function handleOnClick() {
        setShowDropdown(!showDropdown)
    }

    return (
        prop.clickable ? buttonView : normalView
    )
}