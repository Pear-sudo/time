import React, {JSX} from "react";

import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {TimeSelector} from "@/app/elements/inputs/datetime/timeSelector";
import {NumericDateSelector} from "@/app/elements/inputs/datetime/numericDateSelector";

export function DateTimeSelector(prop: {
    callback?: (time: Date) => void,
    default?: Date,
    parentData?: DataWrapper<Date | undefined>
}): JSX.Element {
    return (
        <span>
            <NumericDateSelector
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