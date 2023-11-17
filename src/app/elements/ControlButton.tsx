import React, {JSX, useContext, useEffect, useId, useRef, useState} from "react";
import Image from "next/image";
import plusIcon from "@/app/icons/plus.svg";
import {isUN} from "@/app/utility/lanUtil";
import {toNumber} from "lodash";
import {date2Day, date2Time, Day, DayTime, getDay, Time} from "@/app/utility/timeUtil";
import {Theme} from "@/app/theme";
import {DisplayContext} from "@/app/pages/display";
import {CalendarEvent} from "@/app/model/eventData";

export function ControlButton(): JSX.Element {
    return (
        <div className={'fixed right-2 bottom-2 rounded-full bg-fuchsia-300 hover:cursor-pointer'}
             style={{width: '6vmin', height: '6vmin'}}
        >
            <Image src={plusIcon} alt={''}/>
            <LogCreatorWrapper/>
        </div>
    )
}

function NumberInput(prop: {
    callback: (num: number | undefined) => void,
    value?: number,
    len?: number,
    allowLeadingZero?: boolean,
    min?: number,
    max?: number
}): JSX.Element {
    const oldValueRef = useRef(prop.value == undefined ? "" : prop.value.toString());
    const [value, setValue] = useState(oldValueRef.current)
    const hintRef = useRef<HTMLSpanElement>(null);

    let len = prop.len ? prop.len : 2
    let allowLeadingZero: boolean = isUN(prop.allowLeadingZero) ? true : prop.allowLeadingZero as boolean
    let min = prop.min != undefined ? prop.min : -Infinity
    let max = prop.max != undefined ? prop.max : Infinity

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement
        const oldValue = oldValueRef.current
        const newValue = target.value
        let targetValue = ""

        const isNumber = /^-?\d*$/.test(newValue)
        let num: number | undefined
        if (isNumber) {
            num = toNumber(newValue)
        }
        const isOverflow = newValue.replace(/^-?/, "").length > len
        const leadingZeroViolation = allowLeadingZero ? false : /^-?0/.test(newValue)

        let signViolation = false
        const hasSign = /^-/.test(newValue)
        signViolation = min >= 0 ? hasSign : !hasSign

        // If min is 2000, the first input 2 should be accepted
        // let rangeViolation = false
        // if (num != undefined) {
        //     rangeViolation = num > max || num < min
        // }

        if (!isNumber || isOverflow || leadingZeroViolation || signViolation) {
            reject()
            return
        }

        accept()

        function accept() {
            targetValue = newValue
            finishUp()
        }

        function reject() {
            targetValue = oldValue
            finishUp()
        }

        function finishUp() {
            oldValueRef.current = targetValue
            setValue(targetValue)
            event.preventDefault()
        }
    }

    function handleOnBlur(event: React.FocusEvent<HTMLInputElement>) {
        const targetValue = event.target.value
        const targetNum = toNumber(targetValue)
        if (targetValue !== "" && (targetNum < min || targetNum > max)) {
            if (hintRef.current) {
                hintRef.current.innerText = `${targetValue} is not within the range ${min} to ${max}`
            }
        } else {
            if (hintRef.current && hintRef.current.innerText !== "") {
                hintRef.current.innerText = ""
            }
            prop.callback(toNumber(oldValueRef.current))
        }
    }

    return (
        <span className={'w-fit flex-col inline-flex items-center'}>
            <input type={'text'}
                   inputMode={"numeric"}
                   className={'w-10 text-center'}
                   style={{
                       WebkitAppearance: 'none',
                       MozAppearance: 'textfield'
                   }}
                   placeholder={'0'.repeat(len)} onChange={handleOnChange}
                   onBlur={handleOnBlur}
                   value={value}
            />
            <span className={'text-red-600 text-sm'} ref={hintRef}></span>
        </span>
    )
}


function LogCreator(prop: {
    callback?: (result: PopupResult, data: any) => void,
    submitButtonName?: string,
    existingCE?: PropWrapper<CalendarEvent>
}): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const selfRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLSpanElement>(null);

    const beginTimeRef = useRef<Time>();
    const endTimeRef = useRef<Time>();

    const beginDayRef = useRef<Day>();
    const endDayRef = useRef<Day>();

    const titleRef = useRef("(No title)");
    const locationRef = useRef("");
    const descriptionRef = useRef("");

    const submitButtonName = prop.submitButtonName ? prop.submitButtonName : "Create"

    function extractExistingCE() {
        if (prop.existingCE) {
            const existingCE = prop.existingCE.prop

            titleRef.current = existingCE.title
            locationRef.current = existingCE.location
            descriptionRef.current = existingCE.description

            beginDayRef.current = date2Day(existingCE.begin)
            endDayRef.current = date2Day(existingCE.end)

            beginTimeRef.current = date2Time(existingCE.begin)
            endTimeRef.current = date2Time(existingCE.end)
        }
    }

    function handleOutsideClick(event: React.MouseEvent) {
        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Cancelled, undefined)
        }
    }

    function handleTimeSelectorCallback(ref: React.MutableRefObject<Time | undefined>) {
        return (
            (time: Time) => {
                ref.current = time
            }
        )
    }

    function handleDaySelectorCallback(ref: React.MutableRefObject<Day | undefined>) {
        return (
            (day: Day) => {
                ref.current = day
            }
        )
    }

    function handleCreate(event: React.MouseEvent) {
        const reportingBeginTime = beginTimeRef.current ? beginTimeRef.current : {hour: 0, minute: 0}
        const reportingEndTime = endTimeRef.current ? endTimeRef.current : {hour: 0, minute: 0}

        const reportingBeginDate = new Date(new Date().setHours(reportingBeginTime?.hour, reportingBeginTime?.minute, 0, 0))
        const reportingEndDate = new Date(new Date().setHours(reportingEndTime?.hour, reportingEndTime?.minute, 0, 0))

        if (beginDayRef.current && endDayRef.current) {
            const beginDay = beginDayRef.current
            const endDay = endDayRef.current
            reportingBeginDate.setFullYear(beginDay?.year, beginDay?.month, beginDay?.date)
            reportingEndDate.setFullYear(endDay?.year, endDay?.month, endDay?.date)
        }

        if (reportingBeginDate.valueOf() >= reportingEndDate.valueOf() && hintRef.current) {
            hintRef.current.innerText = "End time is earlier than begin time."
            console.log(reportingBeginDate)
            console.log(reportingEndDate)
            return
        } else if (hintRef.current && hintRef.current.innerText != "") {
            hintRef.current.innerText = ""
        }

        const calendarEvent = new CalendarEvent(reportingBeginDate, reportingEndDate)
        calendarEvent.title = titleRef.current
        calendarEvent.location = locationRef.current
        calendarEvent.description = descriptionRef.current

        if (!prop.existingCE) {
            displayContextObj.dataStore.put(calendarEvent)
        } else {
            Object.assign(prop.existingCE.prop, calendarEvent)
            displayContextObj.dataStore.update(prop.existingCE.prop)
        }
        displayContextObj.dataStoreUpdatedTime = new Date()

        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Success, null)
        }
    }

    function handleDelete(event: React.MouseEvent) {
        if (prop.existingCE) {
            displayContextObj.dataStore.deleteCe(prop.existingCE.prop)
            displayContextObj.dataStoreUpdatedTime = new Date()
            event.stopPropagation()
            if (prop.callback) {
                prop.callback(PopupResult.Delete, null)
            }
        } else {
            handleOutsideClick(event)
            return
        }
    }

    extractExistingCE()

    return (
        <div ref={selfRef}>
            <div className={'fixed bg-black top-0 left-0 cursor-default opacity-50'}
                 style={{width: '100dvw', height: '100dvh'}}
                 onClick={handleOutsideClick}></div>
            <div
                className={'w-fit p-3 fixed rounded bg-cyan-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-default flex-col inline-flex gap-3'}
                style={{height: '50dvh'}}>
                <TextInput placeholder={"Add title"} parentRef={new RefClass(titleRef)}/>
                <span className={'whitespace-nowrap'}>
                    Begin:
                    <DaySelector callback={handleDaySelectorCallback(beginDayRef)}
                                 parentRef={new RefClass(beginDayRef)} defaultDay={beginDayRef.current}/> &nbsp;
                    <TimeSelector callback={handleTimeSelectorCallback(beginTimeRef)} default={beginTimeRef.current}/>
                </span>
                <br/>
                <span className={'whitespace-nowrap'}>
                    End:
                    <DaySelector callback={handleDaySelectorCallback(endDayRef)}
                                 parentRef={new RefClass(endDayRef)} defaultDay={endDayRef.current}/> &nbsp;
                    <TimeSelector callback={handleTimeSelectorCallback(endTimeRef)} default={endTimeRef.current}/>
                </span>
                <span ref={hintRef} className={'text-red-600 text-sm'}></span>
                <TextInput placeholder={"Add location"} parentRef={new RefClass(locationRef)}/>
                <TextInput placeholder={"Add description"} parentRef={new RefClass(descriptionRef)}/>
                <div className={'mt-auto flex-row inline-flex'}>
                    <button className={`${Theme.button} w-fit self-start`} onClick={handleDelete}>Delete</button>
                    <button className={`${Theme.button} w-fit self-end ml-auto`}
                            onClick={handleCreate}>{submitButtonName}</button>
                </div>
            </div>
        </div>
    )
}

export function LogCreatorWrapper(prop: {
    existingCE?: PropWrapper<CalendarEvent>
}): JSX.Element {
    const [showCreator, updateShowCreator] = useState(false);

    function handleOnClick(event: React.MouseEvent) {
        updateShowCreator(true)
        event.stopPropagation()
    }

    function handleCallback(result: PopupResult, data: any) {
        if (result == PopupResult.Cancelled) {
            updateShowCreator(false)
        } else if (result == PopupResult.Success) {
            updateShowCreator(false)
        } else if (result == PopupResult.Delete) {
            updateShowCreator(false)
        }
    }

    return (
        <div className={'absolute hover:cursor-pointer w-full h-full z-10 top-0 left-0'} onClick={handleOnClick}>
            {showCreator ? <LogCreator callback={handleCallback} existingCE={prop.existingCE}/> : null}
        </div>
    )
}

function TimeSelector(prop: {
    callback: (time: Time) => void,
    default?: Time
}): JSX.Element {
    const timeRef = useRef<Time | undefined>(prop.default);

    function handleCallback(key: keyof Time) {
        return (
            (num: number | undefined) => {
                let t: Time
                if (timeRef.current) {
                    t = timeRef.current
                } else {
                    t = {hour: 0, minute: 0}
                }
                if (num) {
                    t[key] = num
                    timeRef.current = t
                }
                activateCallback()
            }
        )
    }

    function activateCallback() {
        const reportingHour = timeRef.current?.hour != undefined ? timeRef.current?.hour : 0
        const reportingMinute = timeRef.current?.minute != undefined ? timeRef.current?.minute : 0
        const time: Time = {
            hour: reportingHour,
            minute: reportingMinute
        }
        prop.callback(time)
    }

    return (
        <span>
            <NumberInput callback={handleCallback("hour")} max={23} min={0} allowLeadingZero={true}
                         value={timeRef.current?.hour}/>
            :
            <NumberInput callback={handleCallback("minute")} max={59} min={0} allowLeadingZero={true}
                         value={timeRef.current?.minute}/>
        </span>
    )
}

function DaySelector(prop: {
    callback: (day: Day) => void,
    defaultDay?: Day,
    parentRef?: RefClass<Day>
}): JSX.Element {
    const day = useRef<Day>(prop.defaultDay ? prop.defaultDay : getDay())

    function handleCallback(t: keyof Day) {
        return (
            (num: number | undefined) => {
                if (num != undefined) {
                    // in js, month starts from 0.
                    day.current[t] = t == "month" ? num - 1 : num

                    if (prop.parentRef) {
                        const ref = prop.parentRef
                        ref.setData(day.current)
                    }
                }
            }
        )
    }

    if (prop.parentRef) {
        prop.parentRef.setData(day.current)
    }

    return (
        <span>
            <NumberInput len={4} callback={handleCallback("year")} allowLeadingZero={false} min={2000} max={3000}
                         value={day.current.year}/>/
            <NumberInput callback={handleCallback("month")} allowLeadingZero={true} min={1} max={12}
                         value={day.current.month + 1}/>/
            <NumberInput callback={handleCallback("date")} allowLeadingZero={true} min={1} max={31}
                         value={day.current.date}/>
        </span>
    )
}

function TextInput(prop: {
    label?: string,
    placeholder?: string,
    parentRef?: RefClass<string>
}): JSX.Element {
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (parentRef && inputRef.current) {
            const data = parentRef.getData()
            inputRef.current.value = data ? data : ""
        }
    }, []);

    const parentRef = prop.parentRef

    function handleOnBlur(event: React.FocusEvent<HTMLInputElement>) {
        const target = event.target
        if (parentRef) {
            parentRef.setData(target.value)
        }
    }

    return (
        <div>
            <label htmlFor={id}>{prop.label}</label>
            <input id={id} type={'text'} placeholder={prop.placeholder} onBlur={handleOnBlur} ref={inputRef}/>
        </div>
    )
}

class RefClass<T> {
    private ref: React.MutableRefObject<T | undefined>;

    constructor(ref: React.MutableRefObject<T | undefined>) {
        this.ref = ref;
    }

    getData(): T | undefined {
        return this.ref?.current;
    }

    setData(data: T | undefined): void {
        this.ref.current = data
    }

}

enum PopupResult {
    Cancelled,
    Success,
    Delete
}

export class PropWrapper<T> {
    get prop(): T {
        return this._prop;
    }

    private _prop: T;

    constructor(prop: T) {
        this._prop = prop
    }

}