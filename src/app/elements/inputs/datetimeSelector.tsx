import {Day, dayKeys, getDay, Time} from "@/app/utility/timeUtil";
import React, {JSX, useRef} from "react";
import {initObject} from "@/app/utility/lanUtil";
import {NumberInput} from "@/app/elements/inputs/numberInput";

import {RefClass} from "@/app/elements/inputs/helper/inputHelper";

export function TimeSelector(prop: {
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

export function DaySelector(prop: {
    callback: (day: Day) => void,
    defaultDay?: Day,
    parentRef?: RefClass<Day>
}): JSX.Element {
    const day = useRef<Required<Day>>(prop.defaultDay ? initObject(dayKeys, prop.defaultDay, 0) : getDay())

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