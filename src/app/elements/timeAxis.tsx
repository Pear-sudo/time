import React, {JSX} from "react";
import {hour2String} from "@/app/utility/timeUtil";
import {Slot} from "@/app/elements/slot";

export function TimeAxisUnit(prop: {
    time: string
}): JSX.Element {
    return (
        <div className={'whitespace-nowrap text-xs w-fit'}>
            {prop.time}
        </div>
    )
}

export function TimeAxis(prop: {
    height: number
}): JSX.Element {
    let elements: JSX.Element[] = []
    for (let i = 0; i < 23; i++) {
        const s_time = hour2String(i + 1)
        elements.push(
            <Slot id={i} className={'invisible'} time={<TimeAxisUnit time={s_time}/>} key={i}/>
        )
    }

    return (
        <div style={{height: `${prop.height}vh`}}>
            {elements}
        </div>
    )
}