import React, {JSX} from "react";
import {YearHint} from "@/app/elements/YearHint";

export function MonthlyCalendar(prop: {focus: Date}): JSX.Element {
    return (
        <div>
            <YearHint dates={[prop.focus]}/>
        </div>
    )
}

function CircledSlot(prop: {text: string, hint: string}): JSX.Element {
    return (
        <div>

        </div>
    )
}