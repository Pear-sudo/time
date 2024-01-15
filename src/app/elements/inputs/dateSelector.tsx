import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import React, {JSX, useRef} from "react";
import {Day} from "@/app/utility/timeUtil";
import {NumberInput} from "@/app/elements/inputs/numberInput";

export function DateSelector(prop: {
    callback?: (day: Date) => void,
    default?: Date,
    parentData?: DataWrapper<Date | undefined>
}): JSX.Element {
    const dayRef = useRef<Date>(prop.default ? prop.default : new Date())

    function handleCallback(t: keyof Day) {
        return (
            (num: number | undefined) => {
                if (num != undefined) {
                    switch (t) {
                        case "year":
                            dayRef.current.setFullYear(num)
                            break
                        case "month":
                            // in js, month starts from 0.
                            const month = num - 1
                            dayRef.current.setMonth(month)
                            break
                        case "date":
                            dayRef.current.setDate(num)
                            break
                    }
                    pass2Parent()
                }
            }
        )
    }

    function pass2Parent() {
        if (prop.parentData) {
            prop.parentData.setData(dayRef.current)
        }
        if (prop.callback) {
            prop.callback(dayRef.current)
        }
    }

    return (
        <span>
            <NumberInput len={4} callback={handleCallback("year")} allowLeadingZero={false} min={2000} max={3000}
                         value={dayRef.current.getFullYear()}/>/
            <NumberInput callback={handleCallback("month")} allowLeadingZero={true} min={1} max={12}
                         value={dayRef.current.getMonth() + 1}/>/
            <NumberInput callback={handleCallback("date")} allowLeadingZero={true} min={1} max={31}
                         value={dayRef.current.getDate()}/>
        </span>
    )
}