import React, {JSX, useContext, useRef, useState} from "react";
import Image from "next/image";
import plusIcon from "@/app/icons/plus.svg";
import {isUN} from "@/app/utility/lanUtil";
import {toNumber} from "lodash";
import {Day, DayTime, getDay, Time} from "@/app/utility/timeUtil";
import {Theme} from "@/app/theme";
import {DisplayContext} from "@/app/pages/display";
import {CalendarEvent} from "@/app/model/eventData";

export function ControlButton(): JSX.Element {
    const [showCreator, updateShowCreator] = useState(false);

    function handleOnClick() {
        updateShowCreator(true)
    }

    function handleCallback(result: PopupResult, data: any) {
        if (result == PopupResult.Cancelled) {
            updateShowCreator(false)
        } else if (result == PopupResult.Success) {
            updateShowCreator(false)
        }
    }

    return (
        <div className={'fixed right-2 bottom-2 rounded-full bg-fuchsia-300 hover:cursor-pointer'}
             style={{width: '6vmin', height: '6vmin'}}
             onClick={handleOnClick}
        >
            <Image src={plusIcon} alt={''}/>
            {showCreator ? <LogCreator callback={handleCallback}/> : null}
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


function LogCreator(prop: { callback: (result: PopupResult, data: any) => void }): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const hintRef = useRef<HTMLSpanElement>(null);

    const beginTimeRef = useRef<Time>();
    const endTimeRef = useRef<Time>();

    const beginDayRef = useRef<Day>();
    const endDayRef = useRef<Day>();

    function handleOutsideClick(event: React.MouseEvent) {
        event.stopPropagation()
        prop.callback(PopupResult.Cancelled, undefined)
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
            return
        } else if (hintRef.current && hintRef.current.innerText != "") {
            hintRef.current.innerText = ""
        }

        displayContextObj.dataStore.put(new CalendarEvent(reportingBeginDate, reportingEndDate))
        displayContextObj.dataStoreUpdatedTime = new Date()

        event.stopPropagation()
        prop.callback(PopupResult.Success, null)
    }

    class RefDay extends Ref<Day> {
        getData(): Day | undefined {
            return this.ref.current;
        }

        setData(data: Day | undefined): void {
            this.ref.current = data
        }

    }

    return (
        <div>
            <div className={'fixed bg-black top-0 left-0 cursor-default opacity-50'}
                 style={{width: '100dvw', height: '100dvh'}}
                 onClick={handleOutsideClick}></div>
            <div
                className={'fixed rounded bg-cyan-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-default'}
                style={{width: '50dvw', height: '50dvh'}}>
                <span>
                    Begin:
                    <DaySelector callback={handleDaySelectorCallback(beginDayRef)}
                                 parentRef={new RefDay(beginDayRef)}/> &nbsp;
                    <TimeSelector callback={handleTimeSelectorCallback(beginTimeRef)}/>
                </span>
                <br/>
                <span>
                    End:
                    <DaySelector callback={handleDaySelectorCallback(endDayRef)}
                                 parentRef={new RefDay(endDayRef)}/> &nbsp;
                    <TimeSelector callback={handleTimeSelectorCallback(endTimeRef)}/>
                </span>
                <span ref={hintRef} className={'text-red-600 text-sm'}></span>
                <button className={`${Theme.button}`} onClick={handleCreate}>Create</button>
            </div>
        </div>
    )
}

function TimeSelector(prop: { callback: (time: Time) => void }): JSX.Element {
    const hour = useRef();
    const minute = useRef();

    function handleCallback(ref: React.MutableRefObject<number | undefined>) {
        return (
            (num: number | undefined) => {
                ref.current = num
                activateCallback()
            }
        )
    }

    function activateCallback() {
        const reportingHour = hour.current != undefined ? hour.current : 0
        const reportingMinute = minute.current != undefined ? minute.current : 0
        const time: Time = {
            hour: reportingHour,
            minute: reportingMinute
        }
        prop.callback(time)
    }

    return (
        <span>
            <NumberInput callback={handleCallback(hour)} max={23} min={0} allowLeadingZero={true}/>
            :
            <NumberInput callback={handleCallback(minute)} max={59} min={0} allowLeadingZero={true}/>
        </span>
    )
}

function DaySelector(prop: { callback: (day: Day) => void, defaultDay?: Day, parentRef?: Ref<Day> }): JSX.Element {
    const d = useRef<Day>(prop.defaultDay ? prop.defaultDay : getDay())

    function handleCallback(t: keyof Day) {
        return (
            (num: number | undefined) => {
                if (num != undefined) {
                    // in js, month starts from 0.
                    d.current[t] = t == "month" ? num - 1 : num

                    if (prop.parentRef) {
                        const ref = prop.parentRef
                        ref.setData(d.current)
                    }
                }
            }
        )
    }

    if (prop.parentRef) {
        prop.parentRef.setData(d.current)
    }

    return (
        <span>
            <NumberInput len={4} callback={handleCallback("year")} allowLeadingZero={false} min={2000} max={3000}
                         value={d.current.year}/>/
            <NumberInput callback={handleCallback("month")} allowLeadingZero={true} min={1} max={12}
                         value={d.current.month + 1}/>/
            <NumberInput callback={handleCallback("date")} allowLeadingZero={true} min={1} max={31}
                         value={d.current.date}/>
        </span>
    )
}

abstract class Ref<T> {
    protected ref: React.MutableRefObject<T | undefined>;

    constructor(ref: React.MutableRefObject<T | undefined>) {
        this.ref = ref;
    }

    abstract getData(): T | undefined

    abstract setData(data: T | undefined): void
}

enum PopupResult {
    Cancelled,
    Success
}