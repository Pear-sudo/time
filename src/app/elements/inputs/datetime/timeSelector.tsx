import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import React, {JSX, useRef} from "react";
import {Time} from "@/app/utility/timeUtil";
import {NumberInput} from "@/app/elements/inputs/numberInput";

export function TimeSelector(prop: {
    default?: Date,
    parentData?: DataWrapper<Date> | DataWrapper<Date | undefined>
}): JSX.Element {
    const timeRef = useRef<Date>(prop.default ? prop.default : new Date());

    function handleCallback(key: keyof Time) {
        return (
            (num: number | undefined) => {
                if (num != undefined) {
                    const time = timeRef.current
                    switch (key) {
                        case "hour":
                            time.setHours(num)
                            break
                        case "minute":
                            time.setMinutes(num)
                            break
                    }
                    pass2Parent()
                }
            }
        )
    }

    function pass2Parent() {
        if (prop.parentData) {
            prop.parentData.setData(timeRef.current)
        }
    }

    return (
        <span>
            <NumberInput callback={handleCallback("hour")} max={23} min={0} allowLeadingZero={true}
                         value={timeRef.current.getHours()}/>
            :
            <NumberInput callback={handleCallback("minute")} max={59} min={0} allowLeadingZero={true}
                         value={timeRef.current.getMinutes()}/>
        </span>
    )
}