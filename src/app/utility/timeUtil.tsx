import {isUN} from "@/app/utility/lanUtil";
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

function getNextDate(today: Date, inverse: boolean = false, skip: number = 0): Date {
    // This function works mysteriously well even if it's the last day of a month.
    let directionSign: number = inverse ? -1 : 1
    let increment: number = (skip + 1) * directionSign

    const nextDate = new Date(today.valueOf())
    nextDate.setDate(nextDate.getDate() + increment)
    // console.log(`Increment: ${increment}, previous: ${today.toString()}, next: ${nextDate.toString()}`)
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

export function generateFullWeekDays(aDayOfWeek: Date): Date[] {
    let dates: Date[] = []
    let currentDayNumber = aDayOfWeek.getDay()
    currentDayNumber = (currentDayNumber + 6) % 7
    const forwardCount = 6 - currentDayNumber
    const backwardCount = 6 - forwardCount
    dates = [...generateDates(aDayOfWeek, backwardCount, false, false), aDayOfWeek, ...generateDates(aDayOfWeek, forwardCount, true, false)]
    return dates
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

function includeDate(date: Date, dates: Date[]): boolean {
    const ids = dates.map((d) => getDayId(d))
    return ids.includes(getDayId(date))
}

export type Time = { hour: number, minute: number }