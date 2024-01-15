import React, {JSX} from "react";

import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {TimeSelector} from "@/app/elements/inputs/timeSelector";
import {DateSelector} from "@/app/elements/inputs/dateSelector";

export function DateTimeSelector(prop: {
    callback?: (time: Date) => void,
    default?: Date,
    parentData?: DataWrapper<Date | undefined>
}): JSX.Element {
    return (
        <span>
            <DateSelector
                default={prop.default}
                callback={prop.callback}
                parentData={prop.parentData}
            />
            &nbsp;
            <TimeSelector
                default={prop.default}
                callback={prop.callback}
                parentData={prop.parentData}
            />
        </span>
    )
}