import {JSX, useState} from "react";
import {DateDisplay} from "@/app/elements/presentation/dateDisplay";
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";
import {YearSelector} from "@/app/elements/inputs/yearSelector";
import {DataWrapper, StateClass} from "@/app/elements/inputs/helper/inputHelper";


export function AdvancedDateSelector(prop: { parentData?: DataWrapper<Date> }): JSX.Element {
    const [selectedDate, setSelectedDate] = useState(new Date())
    function didSet(newValue: Date, oldValue: Date) {
        if (prop.parentData) {
            prop.parentData.setData(newValue)
        }
    }
    return (
        <div>
            <DateDisplay date={selectedDate}/>
            <MonthlyCalendar anchor={selectedDate} allowYearSelection={true}
                             parentData={new StateClass(selectedDate, setSelectedDate, undefined, didSet)}/>
            <YearSelector selectedYear={selectedDate} parentData={new StateClass(selectedDate, setSelectedDate, undefined, didSet)}/>
        </div>
    )
}