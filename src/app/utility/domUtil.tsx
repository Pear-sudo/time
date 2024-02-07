import {JSX} from "react";

export function getElementWidth(element: HTMLDivElement): number {
    let width = 0
    const style = window.getComputedStyle(element)
    width = parseFloat(style.width)
    return width
}

export function getElementHeight(element: HTMLDivElement): number {
    let height = 0
    const style = window.getComputedStyle(element)
    height = parseFloat(style.height)
    return height
}

export function repeatElements(times: number, elementFunc: (index: number) => JSX.Element): JSX.Element[] {
    let elements: JSX.Element[] = []
    for (let i = 0; i < times; i++) {
        elements.push(elementFunc(i))
    }
    return elements
}

function hideScrollBar(container: HTMLDivElement): void {
    // @ts-ignore
    container.style.scrollbarWidth = 'none'; // For Firefox
    // @ts-ignore
    container.style.msOverflowStyle = 'none'; // For Internet Explorer
    // For Chrome, Safari and Opera
    // @ts-ignore
    container.style['&::-webkit-scrollbar'] = {
        display: 'none'
    }
}

function showScrollBar(container: HTMLDivElement): void {
    // @ts-ignore
    container.style.scrollbarWidth = ''; // For Firefox
    // @ts-ignore
    container.style.msOverflowStyle = ''; // For Internet Explorer
    // For Chrome, Safari and Opera
    // @ts-ignore
    container.style['&::-webkit-scrollbar'] = {
        display: ''
    }
}

export function getPixelsBefore(elements: Map<string, HTMLDivElement>, anchorKey: string): number {
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

export function getPosition(element: HTMLDivElement) {
    let x = 0;
    let y = 0;

    while (element) {
        x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        y += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent as HTMLDivElement;
    }

    return {top: y, left: x};
}

type Position = 'start' | 'end' | 'middle';

export function getDistance(x: number, y: number, element: HTMLDivElement, op?: {
    x?: Position,
    y?: Position
}): number {
    op = {
        x: op?.x ?? 'middle',
        y: op?.y ?? 'middle'
    }

    const rect = element.getBoundingClientRect()
    const ox = getAxis(rect.left, rect.right, op.x as Position)
    const oy = getAxis(rect.top, rect.bottom, op.y as Position)

    const dx = x - ox
    const dy = -(y - oy) // y is positive in browser coordination system

    return Math.sqrt(dx ** 2 + dy ** 2)
}

function middle(a: number, b: number): number {
    return (a + b) / 2
}

function getAxis(start: number, end: number, position: Position): number {
    switch (position) {
        case "start":
            return start
        case "end":
            return end
        case "middle":
            return middle(start, end)
    }
}