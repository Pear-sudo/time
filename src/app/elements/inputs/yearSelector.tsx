import {JSX, useEffect, useState} from "react";
import {rollDate} from "@/app/utility/timeUtil";
import {TextButton} from "@/app/elements/ui/buttons/textButton";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";

export function YearSelector(prop: {
    selectedYear: Date,
    from?: Date,
    to?: Date,
    parentData?: DataWrapper<Date>
}): JSX.Element {
    const [focusedYear, setFocusedYear] = useState(prop.selectedYear.getFullYear())
    useEffect(() => {
        setFocusedYear(prop.selectedYear.getFullYear())
    }, [prop.selectedYear]);

    const from = prop.from ?? new Date(1900, 1)
    const to = prop.to ?? new Date(2100, 1)
    if (from.valueOf() > to.valueOf())
        throw new Error("Ending year should be later than the starting year.")

    const years: number[] = []
    let i: Date = from
    while (i.valueOf() <= to.valueOf()) {
        years.push(i.getFullYear())
        i = rollDate(i, {year: 1})
    }

    function generateHandleOnClick(year: number) {
        return (
            function () {
                setFocusedYear(year)
                if (prop.parentData) {
                    prop.parentData.setData(new Date(year, prop.selectedYear.getMonth(), prop.selectedYear.getDate()))
                }
            }
        )
    }

    const yearElements: JSX.Element[] = years.map(year => {
        return (
            <TextButton text={year.toString()} key={year} highlight={year == new Date().getFullYear()}
                        focused={year == focusedYear} onClick={generateHandleOnClick(year)}/>
        )
    })

    return (
        <div className={'grid justify-center'} style={{gridTemplateColumns: "repeat(auto-fill, 100px)"}}>
            {yearElements}
        </div>
    )
}