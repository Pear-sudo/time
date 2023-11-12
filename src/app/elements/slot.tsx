import React, {CSSProperties, JSX} from "react";
import {Theme} from "@/app/theme";

export function Slot(prop: {
    className?: string,
    id: number,
    time?: JSX.Element
}): JSX.Element {
    let isHead = false
    let isTail = false
    if (prop.id === 0)
        isHead = true
    if (prop.id === 23)
        isTail = true

    const baseStyle: CSSProperties = {height: `${1 / 24 * 100}%`}
    const timeAxisAddonStyle: string = Theme.timeAxisAddonStyle

    return (
        <div
            className={`w-full border-neutral-400 relative ${prop.className} ${isTail ? '' : 'border-b'}`}
            style={baseStyle}>
            <div className={`${prop.time ? 'invisible' : `hidden`}`}>{<div
                className={`${timeAxisAddonStyle}`}>{prop.time}</div>}</div>
            <div
                className={`absolute visible inline top-full left-full -translate-x-full -translate-y-1/2 ${timeAxisAddonStyle}`}
            >
                {prop.time}
            </div>
        </div>
    )
}