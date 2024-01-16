import React, {JSX, useEffect, useState} from "react";
import {YearHint} from "@/app/elements/yearHint";
import {Theme} from "@/app/theme";
import {areSameDate, generatePaddedMonth, getDayId, getMonthBegin, rollDate} from "@/app/utility/timeUtil";
import {DataWrapper, StateClass} from "@/app/elements/inputs/helper/inputHelper";
import {DisplayContextObj} from "@/app/model/displayContextObj";
import {NavigationButtons} from "@/app/elements/ui/navigationButtons";
import Image from "next/image";
import arrowDown from "@/app/icons/arrow-down.svg";
import {YearSelector} from "@/app/elements/inputs/datetime/yearSelector";

export function MonthlyCalendar(prop: {
    initialSelection: Date,
    parentData?: DataWrapper<Date>,
    selfHider?: React.Dispatch<React.SetStateAction<boolean>>,
    updateGlobalAnchor?: boolean,
    allowYearSelection?: boolean
}): JSX.Element {
    // anchor controls the dates shown to the user; because the user can click arrow button but choose not to select a new date
    const [anchor, setAnchor] = useState(prop.initialSelection)
    const [selectedDate, setSelectedDate] = useState(prop.initialSelection)
    const [showYearSelector, setShowYearSelector] = useState(false)
    useEffect(() => {
        // don't update in the main function, it will lead to infinite loop, since every update triggers a rerender, and this rerender will issue a new update
        setAnchor(prop.initialSelection)
        setSelectedDate(prop.initialSelection)
    }, [prop.initialSelection]);

    const dates: Date[] = generatePaddedMonth(anchor)

    function generateHandleOnDateClick(date: Date): (event: React.MouseEvent<HTMLButtonElement>) => void {
        return (
            function (event: React.MouseEvent<HTMLButtonElement>) {
                prop.parentData?.setData(date)
                const onDayCountOrAnchorChange = new DisplayContextObj().onDayCountOrAnchorChange
                if (prop.updateGlobalAnchor && onDayCountOrAnchorChange) {
                    onDayCountOrAnchorChange(undefined, date)
                }
                if (prop.selfHider) {
                    prop.selfHider(false)
                } else {
                    setSelectedDate(date)
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
        if (prop.allowYearSelection) {
            setShowYearSelector(!showYearSelector)
        }
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
                         focused={areSameDate(date, selectedDate)}/>
        )
    })
    return (
        <div className={`w-fit flex flex-col`} style={{maxHeight: '50dvh'}}>
            <div className={'inline-flex flex-row items-center justify-between w-full px-2 flex-grow-0 flex-shrink-0'}>
                <div className={`flex ${prop.allowYearSelection ? Theme.button : undefined}`}
                     onClick={handleYearSelectionClick}>
                    <YearHint dates={[anchor]} hasMonthlyCalendar={false}/>
                    <Image src={arrowDown} alt={"arrow down"}
                           className={`h-full ${prop.allowYearSelection ? undefined : 'hidden'}`}/>
                </div>
                <NavigationButtons onClick={onNavigationButtonClick}/>
            </div>
            <div className={'grid gap-x-0.5 w-fit overflow-auto px-2 pb-2 flex-grow-0 flex-shrink-0'}
                 style={{gridTemplateColumns: 'repeat(7, 1fr)'}}
            >
                {weekDayNameSlots}
                {dateSlots}
            </div>
            {/* You must set flexBasis below.
                Because its child's 100% height would refer to this element's basis (that is, full size of the child) if flexBasis is not set.
                If flexBasis is set to a fixed number, it would refer to the element's height after shrinkage. So weird.
                My fault or the browser's bug?
                This only works for firefox and chrome but not for Safari, I believe this is a bug in the web engine.
                The project's layout is becoming increasingly complex!
            */}
            <div className={`${showYearSelector ? '' : 'hidden'} flex-shrink min-h-0`} style={{flexBasis: "1000px"}}>
                <YearSelector selectedYear={anchor}
                              parentData={new StateClass(anchor, setAnchor)}/>
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