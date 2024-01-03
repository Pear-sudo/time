import React, {JSX, useEffect, useState} from "react";
import {YearHint} from "@/app/elements/yearHint";
import {Theme} from "@/app/theme";
import {areSameDate, generatePaddedMonth, getDayId, getMonthBegin, rollDate} from "@/app/utility/timeUtil";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {DisplayContextObj} from "@/app/model/displayContextObj";
import {NavigationButtons} from "@/app/elements/ui/navigationButtons";
import Image from "next/image";
import arrowDown from "@/app/icons/arrow-down.svg";

export function MonthlyCalendar(prop: {
    anchor: Date,
    parentData?: DataWrapper<Date | undefined>,
    selfHider?: React.Dispatch<React.SetStateAction<boolean>>,
    allowYearSelection?: boolean
}): JSX.Element {
    const [anchor, setAnchor] = useState(prop.anchor)
    const [focusedDate, setFocusedDate] = useState(new Date())
    useEffect(() => {
        // don't update in the main function, it will lead to infinite loop, since every update triggers a rerender, and this rerender will issue a new update
        setAnchor(prop.anchor)
    }, [prop.anchor]);

    const dates: Date[] = generatePaddedMonth(anchor)

    function generateHandleOnDateClick(date: Date): (event: React.MouseEvent<HTMLButtonElement>) => void {
        return (
            function (event: React.MouseEvent<HTMLButtonElement>) {
                prop.parentData?.setData(date)
                const onDayCountOrAnchorChange = new DisplayContextObj().onDayCountOrAnchorChange
                if (onDayCountOrAnchorChange) {
                    onDayCountOrAnchorChange(undefined, date)
                }
                if (prop.selfHider) {
                    prop.selfHider(false)
                } else {
                    setFocusedDate(date)
                }
            }
        )
    }

    function onNavigationButtonClick(next: boolean) {
        const monthBegin = getMonthBegin(anchor)
        if (next) {
            setAnchor(rollDate(monthBegin, {month: 1}))
        } else {
            setAnchor(rollDate(monthBegin, {month: -1}))
        }
    }

    function handleYearSelectionClick() {

    }

    const weekDayNameSlots: JSX.Element[] = dates.slice(0, 7).map((date) => {
        const text = new Intl.DateTimeFormat("en-US", {weekday: 'narrow'}).format(date)
        return (
            <CircledSlot text={text} key={getDayId(date) + text}/>
        )
    })
    const dateSlots: JSX.Element[] = dates.map((date) => {
        const highlight: boolean = areSameDate(date, new Date())
        return (
            <CircledSlot text={date.getDate().toString()} key={getDayId(date)}
                         handleOnClick={generateHandleOnDateClick(date)} highlight={highlight}
                         focused={areSameDate(date, focusedDate)}/>
        )
    })
    return (
        <div className={`w-fit`}>
            <div className={'inline-flex flex-row items-center justify-between w-full px-2'}>
                <div className={`flex ${prop.allowYearSelection ? Theme.button : undefined}`} onClick={handleYearSelectionClick}>
                    <YearHint dates={[anchor]} clickable={false}/>
                    <Image src={arrowDown} alt={"arrow down"}
                           className={`h-full ${prop.allowYearSelection ? undefined : 'hidden'}`}/>
                </div>
                <NavigationButtons onClick={onNavigationButtonClick}/>
            </div>
            <div className={'grid gap-x-0.5 w-fit overflow-auto px-2 pb-2'}
                 style={{gridTemplateColumns: 'repeat(7, 1fr)'}}
            >
                {weekDayNameSlots}
                {dateSlots}
            </div>
        </div>
    )
}

function CircledSlot(prop: {
    text: string,
    highlight?: boolean,
    focused?: boolean,
    hint?: string,
    handleOnClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}): JSX.Element {
    return (
        <button
            className={`max-w-full w-fit ${prop.highlight ? Theme.buttonHighlighted : (prop.handleOnClick ? Theme.button : Theme.disabledButton)} ${prop.focused ? Theme.highlightCircle : undefined}`}
            onClick={prop.handleOnClick}>
            {prop.text}
        </button>
    )
}