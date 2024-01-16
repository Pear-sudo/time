import React, {JSX} from "react";

import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {TimeSelector} from "@/app/elements/inputs/datetime/timeSelector";
import {DateSelector} from "@/app/elements/inputs/datetime/dateSelector";

export function DateTimeSelector(prop: {
    callback?: (time: Date) => void,
    default?: Date,
    parentData?: DataWrapper<Date> | DataWrapper<Date | undefined>
}): JSX.Element {
    return (
        <span>
            <DateSelector
                defaultDate={prop.default}
                parentData={prop.parentData}
            />
            &nbsp;
            <TimeSelector
                default={prop.default}
                parentData={prop.parentData}
            />
        </span>
    )
}