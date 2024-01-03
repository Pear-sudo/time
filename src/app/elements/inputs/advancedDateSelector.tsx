import {JSX} from "react";
import {DateDisplay} from "@/app/elements/presentation/dateDisplay";
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";


export function AdvancedDateSelector(prop: {}): JSX.Element {
    const anchor = new Date()
    return (
        <div>
            <DateDisplay date={anchor}/>
            <MonthlyCalendar anchor={anchor} allowYearSelection={true}/>
        </div>
    )
}