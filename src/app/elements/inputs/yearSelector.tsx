import {JSX, useEffect, useRef, useState} from "react";
import {rollDate} from "@/app/utility/timeUtil";
import {TextButton} from "@/app/elements/ui/buttons/textButton";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";
import {isSafari} from "@/app/utility/userUtil";

export function YearSelector(prop: {
    selectedYear: Date,
    from?: Date,
    to?: Date,
    parentData?: DataWrapper<Date>
}): JSX.Element {
    const [focusedYear, setFocusedYear] = useState(prop.selectedYear.getFullYear())
    const selfRef = useRef<HTMLDivElement>(null);
    const scrollToYearRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setFocusedYear(prop.selectedYear.getFullYear())
    }, [prop.selectedYear]);
    useEffect(() => {
        if (isSafari() && selfRef.current) {
            const selfDiv = selfRef.current
            const parentDiv = selfDiv.parentElement
            if (parentDiv) {
                selfDiv.style.height = parentDiv.getBoundingClientRect().height + 'px'
            }
        }
    });
    useEffect(() => {
        const currentYearButton = scrollToYearRef.current
        if (currentYearButton) {
            currentYearButton.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    });

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
        const scrollToYear = year == focusedYear
        if (scrollToYear) {
            return (
                <div ref={scrollToYearRef} className={'w-fit'} key={year}>
                    <TextButton text={year.toString()} highlight={year == new Date().getFullYear()}
                                focused={year == focusedYear} onClick={generateHandleOnClick(year)}/>
                </div>
            )
        }
        return (
            <div className={'w-fit'} key={year}>
                <TextButton text={year.toString()} highlight={year == new Date().getFullYear()}
                            focused={year == focusedYear} onClick={generateHandleOnClick(year)}/>
            </div>
        )
    })

    return (
        // let the top level div height be constrained
        <div className={'overflow-y-scroll h-full'} ref={selfRef}>
            {/* let the following element overflow */}
            <div className={'grid justify-center justify-items-center'}
                 style={{gridTemplateColumns: "repeat(auto-fill, 100px)"}}>
                {yearElements}
            </div>
        </div>
    )
}