import React, {JSX, useEffect, useRef, useState} from "react";
import {getElementWidth, getPixelsBefore} from "@/app/utility/domUtil";
import {arraysEqual, isUN} from "@/app/utility/lanUtil";

export function Pager<DT, PR = any>(prop: {
    dataSet: DT[],
    scrollIndex: number,
    view: number,
    mapData: (data: DT, index: number, array: DT[], isInView: boolean, parentRef?: PR, broadCaster?: undefined, updateBroadCaster?: React.Dispatch<React.SetStateAction<undefined>>) => JSX.Element
    hashData: (data: DT) => string,
    overScrollPixel?: number,
    overScrollPercentage?: number
    parentRef?: PR
}): JSX.Element {
    const propRef = useRef(prop)
    const scrollInfoRef = useRef({scrollLeft: 0})

    const containerRef = useRef<HTMLDivElement>(null)
    const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map())

    // so that each element in the pager can communicate with each other, to solve problems such as the last minute timeline problem
    const [broadCaster, updateBroadCaster] = useState()

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

    function isInView(currentIndex: number, startIndex: number, endIndex: number): boolean {
        return currentIndex >= startIndex && currentIndex <= endIndex
    }

    function mapData(data: DT, index: number, array: DT[]): JSX.Element {
        const inView: boolean = isInView(index, prop.scrollIndex, prop.scrollIndex + prop.view - 1)
        return (
            <div key={prop.hashData(data)}
                 ref={(self) => registerElement(self, prop.hashData(data), elementsRef)}
                 className={'flex-shrink-0'}
                 style={{flexBasis: `${1 / prop.view * 100}%`}}
            >
                {prop.mapData(data, index, array, inView, prop.parentRef, broadCaster, updateBroadCaster)}
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