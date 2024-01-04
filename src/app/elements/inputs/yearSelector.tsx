import {JSX, useState} from "react";
import {rollDate} from "@/app/utility/timeUtil";
import {TextButton} from "@/app/elements/ui/buttons/textButton";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";

export function YearSelector(prop: {
    anchorYear: Date,
    from?: Date,
    to?: Date,
    parentData?: DataWrapper<Date | undefined>
}): JSX.Element {
    const [focusedYear, setFocusedYear] = useState(prop.anchorYear.getFullYear())

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
                    prop.parentData.setData(new Date(year, 1))
                }
            }
        )
    }

    const yearElements: JSX.Element[] = years.map(year => {
        return (
            <TextButton text={year.toString()} key={year} highlight={year == prop.anchorYear.getFullYear()}
                        focused={year == focusedYear} onClick={generateHandleOnClick(year)}/>
        )
    })

    return (
        <div className={'grid'} style={{gridTemplateColumns: "repeat(auto-fill, 100px)"}}>
            {yearElements}
        </div>
    )
}