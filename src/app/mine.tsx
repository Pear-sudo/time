"use client"

import React, {CSSProperties, JSX, MutableRefObject, useEffect, useRef, useState} from "react";
import './index.css';
import arrowPrev from './icons/arrow-prev-small.svg';
import arrowNext from './icons/arrow-next-small.svg';
import Image from "next/image";
import {throttle} from "lodash";
import {date} from "zod";

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

function DayNumber(prop: {
    date: Date,
    children?: React.ReactNode
}): JSX.Element {
    return (
        <div className={`inline-flex flex-col items-center m-1 select-none w-full`}>
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

function TimeAxis(prop: {
    height: number
}): JSX.Element {
    let elements: JSX.Element[] = []
    for (let i = 0; i < 23; i++) {
        const s_time = padNumber(2, i + 1) + ':' + padNumber(2, 0)
        elements.push(
            <Slot id={i} className={'invisible'} time={s_time}/>
        )
    }

    return (
        <div style={{height: `${prop.height}vh`}}>
            {elements}
        </div>
    )
}

function Calendar(prop: {
    dates: Date[]
}): JSX.Element {
    const [changeHeaderBg, updateChangeHeaderBg,] = useState(false)

    const height = 150

    const handleOnScroll = throttle((event: React.UIEvent<HTMLDivElement>): void => {
        const target = event.target as HTMLDivElement
        const scrollTop = target.scrollTop
        updateChangeHeaderBg(scrollTop > 10)
    }, 200)

    function mapDate2DayContent(date: Date, index: number, array: Date[]): JSX.Element {
        return (
            <DayContent date={date} height={height}
                        index={{index: index, length: array.length}}
                        width={{width: `${1 / prop.dates.length * 100}%`}}
            />
        )
    }

    function mapDate2DayNumber(date: Date, index: number, array: Date[]): JSX.Element {
        return (
            <DayNumber date={date}/>
        )
    }

    function getRenderDates(dates: Date[]): Date[] {
        return [...rollDates(prop.dates, -1), ...dates, ...rollDates(prop.dates, 1)]
    }

    const renderDates = getRenderDates(prop.dates)
    const overScrollPercentage: number = -5

    return (
        <div className={'flex-col inline-flex w-full h-full'}>
            <div
                className={`flex-row inline-flex align-top grow-0 ${Theme.transition} ${changeHeaderBg ? Theme.headerBgScrolled : ''}`}>
                <div className={'text-sm invisible relative'}>
                    00:00
                    <div className={'absolute visible top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}>
                        <WeekNumber date={prop.dates.at(0) as Date}/>
                    </div>
                </div>
                <Pager dataSet={renderDates} scrollIndex={prop.dates.length} view={prop.dates.length}
                       mapData={mapDate2DayNumber}
                       hashData={getDayId} overScrollPercentage={overScrollPercentage}/>
            </div>
            <div className={'flex-row inline-flex w-full overflow-y-auto grow'}
                 onScroll={handleOnScroll}>
                <div>
                    <TimeAxis height={height}/>
                </div>
                <Pager dataSet={renderDates} scrollIndex={prop.dates.length} view={prop.dates.length}
                       mapData={mapDate2DayContent}
                       hashData={getDayId} overScrollPercentage={overScrollPercentage}/>
            </div>
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

function Pager<DT>(prop: {
    dataSet: DT[],
    scrollIndex: number,
    view: number,
    mapData: (data: DT, index: number, array: DT[]) => JSX.Element
    hashData: (data: DT) => string,
    overScrollPixel?: number,
    overScrollPercentage?: number
}): JSX.Element {
    const propRef = useRef(prop)
    const scrollInfoRef = useRef({scrollLeft: 0})

    const containerRef = useRef<HTMLDivElement>()
    const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map())

    // @ts-ignore
    useEffect(() => {
        let scrollLeft: number | undefined

        if (!propRef.current) {
            updateRefs()
        }
        const hashData = prop.hashData
        const oldDataSet = propRef.current.dataSet
        const newDataSet = prop.dataSet

        const oldAnchor = propRef.current.dataSet.at(propRef.current.scrollIndex) as DT
        // @ts-ignore
        if (!prop.dataSet.map((d) => prop.hashData(d)).includes(prop.hashData(oldAnchor))) {
            console.warn(`Old anchor is not in the new data set. \nNew: ${prop.dataSet}\nOld Anchor: ${oldAnchor}`)
            updateRefs()
            return
        }

        const oldPixelsBefore: number = getPixelsBefore(elementsRef.current, prop.hashData(oldAnchor))
        const currentAnchor = prop.dataSet.at(prop.scrollIndex) as DT
        const newPixelsBefore: number = getPixelsBefore(elementsRef.current, prop.hashData(currentAnchor))

        if (!isUN(prop.overScrollPercentage)) {
            // let's set the overScroll based on element's percentage
            const firstElement = elementsRef.current.get(hashData(newDataSet[0])) as HTMLDivElement
            const firstElementWidth = getElementWidth(firstElement)
            // @ts-ignore
            overScrollPixel = firstElementWidth * prop.overScrollPercentage / 100
        }

        scrollLeft = newPixelsBefore + overScrollPixel

        const datasetEqual: boolean = arraysEqual(oldDataSet.map(hashData), newDataSet.map(hashData))
        const scrollLeftEqual: boolean = scrollLeft === scrollInfoRef.current.scrollLeft

        // check if rerender is needed
        if (datasetEqual && scrollLeftEqual) {
            return;
        }

        // first let's adjust the position to previous state (after inserting or removing columns)
        containerRef.current?.scrollTo(oldPixelsBefore, 0)

        // second, start the animation
        // @ts-ignore
        containerRef.current?.scrollTo({top: 0, left: scrollLeft, behavior: "smooth"})

        updateRefs()

        function updateRefs() {
            propRef.current = prop
            if (scrollLeft)
                scrollInfoRef.current.scrollLeft = scrollLeft
        }
    })

    let overScrollPixel = prop.overScrollPixel || 0

    function registerElement(self: HTMLDivElement | null, key: string, ref: React.MutableRefObject<Map<string, HTMLDivElement>>): void {
        if (self) {
            ref.current.set(key, self)
        } else {
            ref.current.delete(key)
        }
    }

    function mapData(data: DT, index: number, array: DT[]): JSX.Element {
        return (
            <div key={prop.hashData(data)}
                 ref={(self) => registerElement(self, prop.hashData(data), elementsRef)}
                 className={'flex-shrink-0'}
                 style={{flexBasis: `${1 / prop.view * 100}%`}}
            >
                {prop.mapData(data, index, array)}
            </div>
        )
    }

    return (
        <div
            className={'flex-row inline-flex py-0 px-0 w-full flex-nowrap overflow-x-hidden overflow-y-hidden h-fit'}
            ref={containerRef}
        >
            {prop.dataSet.map(mapData)}
        </div>
    )
}

function arraysEqual<T>(a: T[], b: T[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    a.sort();
    b.sort();

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
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

function isHead(index: number, length: number): boolean {
    return index === 0
}

function isTail(index: number, length: number): boolean {
    return index === length - 1
}

function isMiddle(index: number, length: number): boolean {
    return !isHead(index, length) && !isTail(index, length)
}

function DayContent(prop: {
    height: number,
    date: Date,
    index: {
        index: number,
        length: number
    }
}): JSX.Element {

    let slots: JSX.Element[] = []
    slots = repeatElements(24, (index) => <Slot id={index}
                                                className={isTail(prop.index.index, prop.index.length) ? 'border-x' : 'border-l'}/>)

    return (
        <div style={{height: `${prop.height}vh`}}>
            {slots}
        </div>
    )
}

function WeekNumber(prop: {
    date: Date
}): JSX.Element {
    return (
        <div className={'text-black rounded bg-gray-400 py-1 px-2 select-none'}>
            {getWeek(prop.date)}
        </div>
    )
}

function Slot(prop: {
    className?: string,
    id: number,
    time?: string
}): JSX.Element {
    let isHead = false
    let isTail = false
    if (prop.id === 0)
        isHead = true
    if (prop.id === 23)
        isTail = true

    const baseStyle: CSSProperties = {height: `${1 / 24 * 100}%`}
    return (
        <div
            className={`w-full border-neutral-400 relative ${prop.className} ${isTail ? '' : 'border-b'}`}
            style={baseStyle}>
            <div className={`${prop.time ? 'invisible' : 'hidden'}`}>00:00</div>
            <div
                className={'absolute visible inline top-full left-full -translate-x-full -translate-y-1/2 pr-1 text-sm'}
            >
                {prop.time}
            </div>
        </div>
    )
}

function NavigationButtons(prop: {
    onClick: (nextPeriod: boolean) => void
}): JSX.Element {

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
        <button className={`inline ${Theme.button} rounded-full`} onClick={prop.onClick}>
            <Image src={prop.src} alt={''} width={width} height={height}
                   className={`cursor-pointer ${prop.className}`}/>
        </button>
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

    useEffect(() => {
        function handleResize() {
            resetScroll()
        }

        const handleResizeThrottled = throttle(handleResize, 100)

        window.addEventListener('resize', handleResizeThrottled)

        return () => {
            window.removeEventListener('resize', handleResizeThrottled)
        }
    }, []);

    const onNavigationButtonClick = (nextPeriod: boolean): void => {
        const count = nextPeriod ? 1 : -1
        updateDisplayedDates(rollDates(displayedDates, count))
    }

    const onTodayButtonClick = (): void => {
        onDayCountChange(displayedDates.length, new Date())
    }

    const onDayCountChange = (count: number, anchor?: Date): void => {
        anchor = anchor ? anchor : displayedDates[0]
        switch (count) {
            case 7:
                updateDisplayedDates(generateFullWeekDays(anchor))
                break
            default:
                const days = generateDates(anchor, count)
                updateDisplayedDates(days)
        }
    }

    const resetScroll = (): void => {
        onDayCountChange(displayedDates.length)
    }

    return (
        <div className={'w-full h-screen'} style={{display: 'grid', gridTemplateRows: 'auto 1fr'}}>
            <div className={'inline-flex flex-row justify-center'}>
                <DayCount onChange={onDayCountChange}/>
                <TodayButton onClick={onTodayButtonClick}/>
                <NavigationButtons onClick={onNavigationButtonClick}/>
                <YearHint dates={displayedDates}/>
            </div>
            <div className={'mx-8 overflow-y-hidden'}>
                <Calendar dates={displayedDates}/>
            </div>
            <ControlButton/>
        </div>
    )
}

function TodayButton(prop: {
    onClick?: () => void
}): JSX.Element {
    return (
        <button onClick={prop.onClick} className={`${Theme.button}`}>
            Today
        </button>
    )
}

class Theme {
    static button: string = "px-2 hover:bg-gray-200 focus:ring focus:ring-gray-100 rounded active:bg-gray-300 focus:outline-none"
    static headerBgScrolled: string = "bg-cyan-50"
    static transition: string = "transition-colors"
}

function DayCount(prop: {
    onChange: (count: number) => void
}): JSX.Element {
    const [index, updateIndex] = useState(0)
    const [visible, updateVisible] = useState(false)
    const choices: string[] = ["Week", 'Day', '3 Days', '5 Days']
    const choicesN: number[] = [7, 1, 3, 5]

    function onClick() {
        updateVisible(!visible)
    }

    function onIndexUpdate(index: number): void {
        // if cancelled
        if (index === -1) {
            updateVisible(false)
            return
        }
        updateVisible(false)
        updateIndex(index)
        prop.onChange(choicesN[index])
    }

    return (
        <div className={'h-full relative'}>
            <button className={`${Theme.button} h-full`} onClick={onClick}>
                {choices[index]}
            </button>
            {/* don't apply transform here, it will mess up z index in Choices */}
            <div className={'absolute top-full left-0 w-fit'}>
                <Choices elements={choices} onIndexUpdate={onIndexUpdate} visible={visible}/>
            </div>
        </div>
    )
}

function Choices(prop: {
    elements: string[],
    onIndexUpdate: (index: number) => void,
    visible: boolean
}): JSX.Element {
    const elementsDivs: JSX.Element[] = []
    let visible = prop.visible

    function onClick(index: number) {
        return (event: React.UIEvent<HTMLButtonElement>) => {
            prop.onIndexUpdate(index)
        }
    }

    function onCancel() {
        prop.onIndexUpdate(-1)
    }

    for (let i = 0; i < prop.elements.length; i++) {
        const element = prop.elements[i]
        elementsDivs.push(
            <button key={i + element} className={`relative z-50 w-full whitespace-nowrap ${Theme.button}`}
                    onClick={onClick(i)}>
                {element}
            </button>
        )
    }

    return (
        <div
            className={`z-50 relative bg-cyan-50 rounded p-1 flex flex-col w-fit ${visible ? 'visible' : 'invisible'}`}>
            {elementsDivs}
            <div className={'z-40 fixed'}
                 style={{width: '200vw', height: '200vh', left: '-100vw', top: '-100vh'}} onClick={onCancel}>
            </div>
        </div>
    )
}

function SideBar(): JSX.Element {
    return (
        <div>

        </div>
    )
}

function ControlButton(): JSX.Element {
    return (
        <div className={''}>
            <div className={'fixed right-2 bottom-2 rounded-full bg-fuchsia-300'}
                 style={{width: '6vmin', height: '6vmin'}}>
            </div>
        </div>
    )
}

function YearHint(prop: {
    dates: Date[]
}): JSX.Element {
    let hint: string = ''

    const firstDate = prop.dates[0]
    const lastDate = prop.dates[prop.dates.length - 1]

    const firstYearStr = new Intl.DateTimeFormat("en-US", {year: 'numeric'}).format(firstDate)
    const firstMonthStrS = new Intl.DateTimeFormat("en-US", {month: 'short'}).format(firstDate)
    const lastMonthStrS = new Intl.DateTimeFormat("en-US", {month: 'short'}).format(lastDate)
    const firstMonthStrL = new Intl.DateTimeFormat("en-US", {month: 'long'}).format(firstDate)

    if (firstDate.getMonth() !== lastDate.getMonth()) {
        hint = firstMonthStrS + ' - ' + lastMonthStrS + ' ' + firstYearStr
    } else {
        hint = firstMonthStrL + ' ' + firstYearStr
    }

    return (
        <div>
            <button className={`h-full ${Theme.button}`}>
                {hint}
            </button>
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
