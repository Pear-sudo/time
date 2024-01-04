import {JSX} from "react";
import {DateDisplay} from "@/app/elements/presentation/dateDisplay";
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";
import {YearSelector} from "@/app/elements/inputs/yearSelector";


export function AdvancedDateSelector(prop: {}): JSX.Element {
    const anchor = new Date()
    return (
        <div>
            <DateDisplay date={anchor}/>
            <MonthlyCalendar anchor={anchor} allowYearSelection={true}/>
            <YearSelector anchorYear={anchor}/>
        </div>
    )
}