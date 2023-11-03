"use client"

import React, {CSSProperties, JSX, MutableRefObject, useEffect, useRef, useState} from "react";
import './index.css';
import arrowPrev from './icons/arrow-prev-small.svg';
import arrowNext from './icons/arrow-next-small.svg';
import Image from "next/image";
import {start} from "repl";
import {ClassName, id} from "postcss-selector-parser";
import assert from "assert";

function getWeek(today: Date): number {
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

function getWeekDay(date: Date, options: Intl.DateTimeFormatOptions = {weekday: "short"}): string {
    return new Intl.DateTimeFormat("en-US", options).format(date)
}

function areSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function DayNumber(prop: { date: Date, children?: React.ReactNode }): JSX.Element {
    return (
        <div className={`inline-flex flex-col items-center m-1 select-none`}>
            <div className={`${areSameDate(prop.date, new Date()) ? 'text-sky-700' : ''}`}>
                {getWeekDay(prop.date)}
            </div>
            <div
                className={`${areSameDate(prop.date, new Date()) ? 'rounded-full text-white bg-sky-700' : ''} h-4 w-4 p-2 box-content text-center leading-4 relative`}>
                {prop.children ? '' : prop.date.getDate()}
                <div className={'absolute visible'}>{prop.children}</div>
            </div>
        </div>
    )
}

function Calendar(prop: { dates: Date[] }): JSX.Element {
    const height = 150
    const dateToTest = prop.dates[0]
    return (
        <div className={'flex-row inline-flex p-1 w-full px-5 h-screen overflow-y-auto'}>
            <Column height={height} date={dateToTest} axis={true}/>
            <Days dates={prop.dates} height={height}/>
        </div>
    )
}

function getDayId(date: Date): string {
    let id = padNumber(4, date.getFullYear()) + padNumber(2, date.getMonth()) + padNumber(2, date.getDate())
    // console.log(id)
    return id
}

function includeDate(date: Date, dates: Date[]): boolean {
    const ids = dates.map((d) => getDayId(d))
    return ids.includes(getDayId(date))
}

function getElementWidth(element: HTMLDivElement): number {
    let width = 0
    const style = window.getComputedStyle(element)
    width = parseFloat(style.width)
    return width
}

function getPixelsBefore(elements: Map<string, HTMLDivElement>, anchorKey: string): number {
    let pixelsBefore: number = 0
    for (const [k, v] of elements) {
        if (k !== anchorKey) {
            pixelsBefore += getElementWidth(v)
        } else {
            return pixelsBefore
        }
    }
    return pixelsBefore
}

function Days(prop: { dates: Date[], height: number }): JSX.Element {
    const selfDivRef = useRef<HTMLDivElement>()
    const columnsRef = useRef<Map<string, HTMLDivElement>>(new Map())
    const propRef = useRef(prop)
    const renderRef = useRef<Date[]>([])
    const lastScrollRef = useRef<Date>()

    useEffect(() => {
        if (!lastScrollRef.current) {
            updateRefs()
        }

        // @ts-ignore
        if (!columnsRef.current.has(getDayId(lastScrollRef.current))) {
            return
        }

        // first let's adjust the position to previous state (after inserting or removing columns)
        let anchor: Date = lastScrollRef.current as Date
        let pixelsBefore: number = getPixelsBefore(columnsRef.current, getDayId(anchor))
        selfDivRef.current?.scrollTo(pixelsBefore, 0)

        // second, start the animation
        anchor = scrollToDate
        pixelsBefore = getPixelsBefore(columnsRef.current, getDayId(anchor))
        selfDivRef.current?.scrollTo({top: 0, left: pixelsBefore, behavior: "smooth"})

        updateRefs()
    })

    // @ts-ignore
    let scrollToDate: Date = prop.dates.at(0)
    const renderDates: Date[] = getRenderDates(prop.dates)

    function updateRefs() {
        propRef.current = prop
        renderRef.current = renderDates
        lastScrollRef.current = scrollToDate
    }

    function getRenderDates(dates: Date[]): Date[] {
        return [...rollDates(prop.dates, -1), ...dates, ...rollDates(prop.dates, 1)]
    }

    function registerSelf(self: HTMLDivElement | null, key: string): void {
        if (self) {
            columnsRef.current.set(key, self)
        } else {
            columnsRef.current.delete(key)
        }
    }

    function mapDate(date: Date, index: number, array: Date[]): JSX.Element {
        return (
            <div key={getDayId(date)}
                 ref={(self) => registerSelf(self, getDayId(date))}
                 className={'flex-shrink-0'}
                 style={{flexBasis: `${1 / prop.dates.length * 100}%`}}
            >
                <Column date={date} height={prop.height}
                        index={{index: index, length: array.length}}
                        width={{width: `${1 / prop.dates.length * 100}%`}}
                />
            </div>
        )
    }

    return (
        <div className={'flex-row inline-flex py-1 px-0 w-full flex-nowrap overflow-x-hidden overflow-y-hidden h-fit'}
             ref={selfDivRef}
        >
            {renderDates.map(mapDate)}
        </div>
    )
}

function generateDates(from: Date, length: number, isFuture: boolean = true, inclusive: boolean = true): Date[] {
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

function repeatElements(times: number, elementFunc: (index: number) => JSX.Element): JSX.Element[] {
    let elements: JSX.Element[] = []
    for (let i = 0; i < times; i++) {
        elements.push(elementFunc(i))
    }
    return elements
}

function padNumber(length: number, number: number): string {
    let s_number = number.toString()
    const number_len = s_number.length
    const vacant_len = length - number_len

    if (vacant_len <= 0)
        return s_number

    for (let i = 0; i < vacant_len; i++) {
        s_number = '0' + s_number
    }
    return s_number
}

function repeatTimeline(): JSX.Element[] {
    let elements: JSX.Element[] = []
    for (let i = 0; i < 23; i++) {
        const s_time = padNumber(2, i + 1) + ':' + padNumber(2, 0)
        elements.push(<Slot className={'invisible'}><TimeLine time={s_time}/></Slot>)
    }
    return elements
}

function isHead(index: number, length: number): boolean {
    return index === 0
}

function isTail(index: number, length: number): boolean {
    return index === length - 1
}

function isMiddle(index: number, length: number): boolean {
    return !isHead(index, length) && !isTail(index, length)
}

function Column(prop: {
    height: number,
    date: Date,
    axis?: boolean,
    index?: { index: number, length: number }
    width?: CSSProperties
}): JSX.Element {

    let slots: JSX.Element[] = []
    let head: JSX.Element
    if (!prop.axis) {
        if (prop.index) {
            // @ts-ignore
            slots = repeatElements(24, (index) => <Slot id={index}
                                                        className={isTail(prop.index.index, prop.index.length) ? 'border-x' : 'border-l'}/>)
        }
        head = <DayNumber date={prop.date}/>
    } else {
        slots = repeatTimeline()
        head = <DayNumber date={prop.date}>{<WeekNumber date={prop.date}/>}</DayNumber>
    }

    return (
        <div className={`shrink -mr-px ${prop.axis ? 'w-fit' : 'w-full'}`}>
            <div className={`inline-flex flex-row justify-center w-full ${prop.axis ? 'invisible' : ''}`}>
                {head}
            </div>
            <div style={{height: `${prop.height}vh`}}>
                {slots}
            </div>
        </div>
    )
}

function WeekNumber(prop: { date: Date }): JSX.Element {
    return (
        <div className={'text-black rounded bg-gray-400 py-1 px-2 -translate-x-3'}>
            {getWeek(prop.date)}
        </div>
    )
}

function TimeLine(prop: { time: string }): JSX.Element {
    return (
        <div
            className={'absolute visible inline top-full left-full -translate-x-full -translate-y-1/2 pr-1 text-sm'}>{prop.time}</div>
    )
}

function Slot(prop: { className?: string, id?: number, children?: React.ReactNode }): JSX.Element {
    let isHead = false
    let isTail = false
    if (prop.id !== undefined && prop.id !== null) {
        if (prop.id === 0)
            isHead = true
        if (prop.id === 23)
            isTail = true
    }
    const baseStyle: CSSProperties = {height: `${1 / 24 * 100}%`, marginTop: '-1px'}
    return (
        <div
            className={`w-full border-neutral-400 relative ${prop.className} ${isHead ? '' : 'border-t'} ${isTail ? '' : 'border-b'}`}
            style={baseStyle}>
            {prop.children}
        </div>
    )
}

function NavigationButtons(prop: { onClick: (nextPeriod: boolean) => void }): JSX.Element {

    return (
        <div className={'inline-flex flex-row'}>
            <ImageButton src={arrowPrev} className={''} onClick={() => prop.onClick(false)}/>
            <ImageButton src={arrowNext} className={''} onClick={() => prop.onClick(true)}/>
        </div>
    )
}

function isUN(v: any): boolean {
    return v === null || v === undefined;
}

function ImageButton(prop: {
    src: string,
    width?: number,
    height?: number,
    className?: string,
    onClick?: () => void
}): JSX.Element {
    let width = prop.width
    let height = prop.height
    if (isUN(width))
        width = 32
    if (isUN(height))
        height = 32
    return (
        <div className={'inline'} onClick={prop.onClick}>
            <Image src={prop.src} alt={''} width={width} height={height}
                   className={`cursor-pointer ${prop.className}`}/>
        </div>
    )
}

function rollDates(dates: Date[], count: number, step?: number): Date[] {
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

function generateFullWeekDays(aDayOfWeek: Date): Date[] {
    let dates: Date[] = []
    let currentDayNumber = aDayOfWeek.getDay()
    currentDayNumber = (currentDayNumber + 6) % 7
    const forwardCount = 6 - currentDayNumber
    const backwardCount = 6 - forwardCount
    dates = [...generateDates(aDayOfWeek, backwardCount, false, false), aDayOfWeek, ...generateDates(aDayOfWeek, forwardCount, true, false)]
    return dates
}

function Display(): JSX.Element {
    const [displayedDates, updateDisplayedDates] = useState(generateFullWeekDays(new Date()))

    const onNavigationButtonClick = (nextPeriod: boolean): void => {
        const count = nextPeriod ? 1 : -1
        updateDisplayedDates(rollDates(displayedDates, count))
    }

    return (
        <div className={'w-full'}>
            <DayCount/>
            <NavigationButtons onClick={onNavigationButtonClick}/>
            <Calendar dates={displayedDates}/>
        </div>
    )
}

function DayCount(): JSX.Element {
    return (
        <div>
        </div>
    )
}

function DropDown(): JSX.Element {
    return (
        <div>

        </div>
    )
}

export default function Layout(): JSX.Element {
    return (
        <div className={'flex-row inline-flex justify-center w-full'}>
            <Display/>
        </div>
    )
}
