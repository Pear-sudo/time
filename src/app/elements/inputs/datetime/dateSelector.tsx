import {JSX, useState} from "react";
import {DateDisplay} from "@/app/elements/presentation/dateDisplay";
import {Theme} from "@/app/theme";
import {WindowController, WindowManager} from "@/app/utility/windowManager";
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";
import {DataWrapper, StateClass} from "@/app/elements/inputs/helper/inputHelper";
import {set2SameDay} from "@/app/utility/timeUtil";

export function DateSelector(prop: {
    defaultDate?: Date,
    parentData?: DataWrapper<Date> | DataWrapper<Date | undefined>
}): JSX.Element {
    const [date, setDate] = useState<Date>(prop.defaultDate ?? new Date());

    const wm = new WindowManager()
    const wKey: string = "dateSelector"
    let wController: WindowController

    function handleOutsideClick() {
        closeWindow()
    }

    function closeWindow() {
        wm.closeWindow(wController)
    }

    function handleDateSelection(newValue: Date, oldValue: Date) {
        if (prop.parentData) {
            const reference = prop.parentData.getData()
            if (reference) {
                prop.parentData.setData(set2SameDay(reference, newValue))
            } else {
                console.log("You may notice something weird has happened, that's because I did not get the original date object for reference." +
                    "beginDTRef and etc relies on this!")
            }
        }
        closeWindow()
    }

    function handleOnClick() {
        wController = wm.createWindow({
            view: (
                <MonthlyCalendar initialSelection={date} allowYearSelection={true}
                                 parentData={new StateClass(date, setDate, {didSet: handleDateSelection})}/>
            ),
            key: wKey,
            onWindowClose: handleOutsideClick,
            header: true,
            rounded: true
        })
    }

    return (
        <span className={`${Theme.button}`} onClick={handleOnClick}>
            <DateDisplay date={date}/>
        </span>
    )
}