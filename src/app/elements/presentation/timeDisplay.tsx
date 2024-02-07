export function TimeDisplay(prop: { date: Date }) {
    const date = prop.date
    const hourStr = new Intl.DateTimeFormat("en-US", {hour: '2-digit'}).format(date)
    const minuteStr = new Intl.DateTimeFormat("en-US", {minute: '2-digit'}).format(date)

    const formattedDate: string = `${hourStr}:${minuteStr}`

    return (
        <span>
            {formattedDate}
        </span>
    )
}