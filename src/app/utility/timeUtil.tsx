import {genNums, initObject, isUN} from "@/app/utility/lanUtil";
import {padNumber} from "@/app/utility/numberUtil";
import * as math from 'mathjs';

export function areSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export function getWeekDay(date: Date, options: Intl.DateTimeFormatOptions = {weekday: "short"}): string {
    return new Intl.DateTimeFormat("en-US", options).format(date)
}

export function getWeek(today: Date): number {
    //TODO support different begging day
    const beginning = new Date(today.getFullYear(), 0)
    const elapsedTime = today.getTime() - beginning.getTime()
    const elapsedDays = Math.ceil(elapsedTime / (1000 * 60 * 60 * 24))

    const adjustedBeginningDay = (beginning.getDay() + 6) % 7
    const remainderFromLastYear = (6 - adjustedBeginningDay + 1) % 7
    return Math.ceil(
        (elapsedDays - remainderFromLastYear) / 7
    )
}

export function generateDates(from: Date, length: number, isFuture: boolean = true, inclusive: boolean = true): Date[] {
    let dates: Date[] = [from]
    let count = length
    if (inclusive)
        count -= 1
    for (let i = 0; i < count; i++) {
        if (isFuture)
            // @ts-ignore
            dates.push(getNextDate(dates.at(-1)))
        else {
            // @ts-ignore
            dates.unshift(getNextDate(dates.at(0), true))
        }
    }
    if (!inclusive) {
        if (isFuture)
            dates.splice(0, 1)
        else
            dates.pop()
    }
    return dates
}

export function getNextDate(today: Date, inverse: boolean = false, skip: number = 0, resetTime: boolean = false): Date {
    // This function works mysteriously well even if it's the last day of a month.
    let directionSign: number = inverse ? -1 : 1
    let increment: number = (skip + 1) * directionSign

    const nextDate = new Date(today.valueOf())
    nextDate.setDate(nextDate.getDate() + increment)
    // console.log(`Increment: ${increment}, previous: ${today.toString()}, next: ${nextDate.toString()}`)
    if (resetTime) {
        return getBeginningOfDay(nextDate)
    }
    return nextDate
}

function getElapsedTime(a: Date, b: Date): number {
    const before: Date = a.valueOf() < b.valueOf() ? a : b
    const after: Date = a.valueOf() >= b.valueOf() ? a : b

    return after.valueOf() - before.valueOf()
}

function getTimeRatio(elapsedTime: number, total: 'day'): number {
    let denominator: number = 0
    switch (total) {
        case 'day':
            denominator = 86400000 // 24 * 60 * 60 * 1000
            break
    }
    return math.divide(elapsedTime, denominator)
}

function getBeginningOfDay(d: Date): Date {
    const beginning = new Date(d.valueOf())
    beginning.setHours(0, 0, 0, 0)
    return beginning
}

export function getRatioOfDay(d: Date) {
    const elapsed = getElapsedTime(d, getBeginningOfDay(d))
    return getTimeRatio(elapsed, 'day')
}

export function isToday(d: Date): boolean {
    return areSameDate(d, new Date())
}

export function rollDates(dates: Date[], count: number, step?: number): Date[] {
    // count can be negative, which indicts the opposite direction
    if (count === 0)
        return dates

    if (step === undefined) {
        step = dates.length
    }
    const delta = Math.abs(count) * (step - 1)
    const inverse: boolean = count < 0

    let newDates: Date[] = []
    for (const dateKey in dates) {
        newDates.push(getNextDate(dates[dateKey], inverse, delta))
    }

    return newDates
}

export function rollDate(date: Date, dayTime: DayTime): Date {
    date = new Date(date.valueOf())
    const dt = initObject(dayTimeKeys, dayTime, 0)
    // the number of days in a month may vary, let the library do the job
    date.setFullYear(date.getFullYear() + dt.year, date.getMonth() + dt.month, date.getDate() + dt.date)
    date.setHours(date.getHours() + dt.hour, date.getMinutes() + dt.minute, date.getSeconds() + dt.second, date.getMilliseconds() + dt.millisecond)
    return date
}

export function generateFullWeekDays(aDayOfWeek: Date): Date[] {
    let dates: Date[] = []
    let currentDayNumber = aDayOfWeek.getDay()
    currentDayNumber = (currentDayNumber + 6) % 7
    const forwardCount = 6 - currentDayNumber
    const backwardCount = 6 - forwardCount
    dates = [...generateDates(aDayOfWeek, backwardCount, false, false), aDayOfWeek, ...generateDates(aDayOfWeek, forwardCount, true, false)]
    return dates
}

export function generatePaddedMonth(aDayOfMonth: Date): Date[] {
    let dates: Date[] = []
    const monthBeginDate = getMonthBegin(aDayOfMonth)
    const monthEndDate = getMonthEnd(aDayOfMonth)
    const firstPaddedWeek: Date[] = generateFullWeekDays(monthBeginDate)
    const lastPaddedWeek: Date[] = generateFullWeekDays(monthEndDate)
    let middlePaddedWeek: Date[] = firstPaddedWeek
    let count = 0
    while (!areSameDate(middlePaddedWeek[0], lastPaddedWeek[0]) && count < 6) {
        dates.push(...middlePaddedWeek)
        middlePaddedWeek = rollDates(middlePaddedWeek, 1)

        // just serve as a safeguard for the dangerous while loop
        count++
    }
    dates.push(...lastPaddedWeek)
    return dates
}

export function getMonthBegin(aDayOfMonth: Date): Date {
    return new Date(aDayOfMonth.getFullYear(), aDayOfMonth.getMonth(), 1)
}

export function getMonthEnd(aDayOfMonth: Date): Date {
    const year = aDayOfMonth.getFullYear();
    const month = aDayOfMonth.getMonth();
    const firstDayNextMonth = new Date(year, month + 1, 1);
    return new Date(firstDayNextMonth.getTime() - 1)
}

export function hour2String(hour: number, mode?: '24' | '12'): string {
    if (isUN(mode)) {
        mode = '12'
    }
    switch (mode) {
        case '24':
            return padNumber(2, hour) + ':' + padNumber(2, 0)
        case '12':
            const endStr = hour < 12 ? 'AM' : 'PM'
            return hour + ' ' + endStr
        default:
            return ''
    }
}

export function getDayId(date: Date): string {
    let id = padNumber(4, date.getFullYear()) + padNumber(2, date.getMonth()) + padNumber(2, date.getDate())
    // console.log(id)
    return id
}

export function includeDate(date: Date, dates: Date[]): boolean {
    const ids = dates.map((d) => getDayId(d))
    return ids.includes(getDayId(date))
}

export type Time = {
    hour?: number,
    minute?: number
    second?: number
    millisecond?: number
}
export const timeKeys: Array<keyof Time> = ['hour', 'minute', 'second', 'millisecond']

export type Day = {
    year?: number,
    month?: number,
    date?: number
}
export const dayKeys: Array<keyof Day> = ['year', 'month', 'date']

export type DayTime = Day & Time
export const dayTimeKeys: Array<keyof DayTime> = [...timeKeys, ...dayKeys]

export function getDay(date?: Date): Required<Day> {
    let d: Date = date ? date : new Date()
    return {year: d.getFullYear(), month: d.getMonth(), date: d.getDate()}
}

export enum DayTimeEnum {
    year,
    month,
    date,
    hour,
    minute
}

export function date2Day(date: Date | undefined): Day | undefined {
    if (!date) {
        return undefined
    }
    return {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate()
    }
}

export function date2Time(date: Date | undefined): Time | undefined {
    if (!date) {
        return undefined
    }
    return {
        hour: date.getHours(),
        minute: date.getMinutes()
    }
}

export function percentage2Date(date: Date, percentage: number) {
    // adjust a Date's time according to percentage
    const millisecondsTotal = 24 * 60 * 60 * 1000
    const passedMilli = millisecondsTotal * percentage
    const adjustedMilli = getBeginningOfDay(date).valueOf() + passedMilli
    return new Date(adjustedMilli)
}

export function set2SameDay(reference: Date, target: Date): Date {
    // I intentionally choose not create a new date object. Use this function carefully !!!
    reference.setFullYear(target.getFullYear())
    reference.setMonth(target.getMonth())
    reference.setDate(target.getDate())
    return reference
}

export function deg2Time(deg: number, mode: TimeMode): number {
    if (deg < 0) {
        deg = 360 + deg
    }

    let slides = mode == ("hourAM" || "hourPM") ? 12 : 60
    let interval = 360 / slides
    let half = interval / 2

    let adjustment = 90 + half
    deg = 360 - (((360 - adjustment) + deg) % 360)

    let count = Math.floor(deg / interval)

    const from = mode == "hourPM" ? 12 : 0

    return genNums({count: slides, from: from})[count]
}

export type TimeMode = "hourAM" | "hourPM" | "minute"