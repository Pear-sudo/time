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

function getPosition(element: HTMLDivElement) {
    let x = 0;
    let y = 0;

    while (element) {
        x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        y += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent as HTMLDivElement;
    }

    return {top: y, left: x};
}