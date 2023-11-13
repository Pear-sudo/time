import React, {JSX, useContext, useRef, useState} from "react";
import Image from "next/image";
import plusIcon from "@/app/icons/plus.svg";
import {isUN} from "@/app/utility/lanUtil";
import {toNumber} from "lodash";
import {Time} from "@/app/utility/timeUtil";
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
    len?: number,
    allowLeadingZero?: boolean,
    min?: number,
    max?: number
}): JSX.Element {
    const oldValueRef = useRef("");

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

        let rangeViolation = false
        if (num != undefined) {
            rangeViolation = num > max || num < min
        }

        if (!isNumber || isOverflow || leadingZeroViolation || rangeViolation || signViolation) {
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
            target.value = targetValue
            oldValueRef.current = targetValue
            event.preventDefault()
        }
    }

    function handleOnBlur() {
        prop.callback(toNumber(oldValueRef.current))
    }

    return (
        <span className={'w-fit'}>
            <input type={'text'}
                   inputMode={"numeric"}
                   className={'w-10 text-center'}
                   style={{
                       WebkitAppearance: 'none',
                       MozAppearance: 'textfield'
                   }}
                   placeholder={'0'.repeat(len)} onChange={handleOnChange}
                   onBlur={handleOnBlur}
            />
        </span>
    )
}


function LogCreator(prop: { callback: (result: PopupResult, data: any) => void }): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const beginTimeRef = useRef<Time>();
    const endTimeRef = useRef<Time>();

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

    function handleCreate(event: React.MouseEvent) {
        const reportingBeginTime = beginTimeRef.current ? beginTimeRef.current : {hour: 0, minute: 0}
        const reportingEndTime = endTimeRef.current ? endTimeRef.current : {hour: 0, minute: 0}
        displayContextObj.dataStore.put(
            new CalendarEvent(
                new Date(new Date().setHours(reportingBeginTime?.hour, reportingBeginTime?.minute, 0, 0)),
                new Date(new Date().setHours(reportingEndTime?.hour, reportingEndTime?.minute, 0, 0))
            )
        )
        displayContextObj.dataStoreUpdatedTime = new Date()
        event.stopPropagation()
        prop.callback(PopupResult.Success, null)
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
                    Begin: <TimeSelector callback={handleTimeSelectorCallback(beginTimeRef)}/>
                </span>
                <br/>
                <span>
                    End: <TimeSelector callback={handleTimeSelectorCallback(endTimeRef)}/>
                </span>
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

enum PopupResult {
    Cancelled,
    Success
}