import {JSX} from "react";

export function DateDisplay(prop: { date: Date, format?: { bold?: boolean } }): JSX.Element {
    const date = prop.date
    const yearStr = new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(date)
    const monthStr = new Intl.DateTimeFormat("en-US", {month: 'short'}).format(date)
    const dayStr = new Intl.DateTimeFormat("en-US", {day: 'numeric'}).format(date)
    const formattedDate: string = `${monthStr} ${dayStr}, ${yearStr}`

    const format = prop.format ?? {bold: false}
    return (
        <span className={`${format.bold ? 'font-bold' : ''}`}>
            {formattedDate}
        </span>
    )
}