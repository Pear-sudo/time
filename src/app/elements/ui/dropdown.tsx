import React, {JSX, useEffect, useRef} from "react";
import {Theme} from "@/app/theme";

export function Dropdown(prop: {
    parent: JSX.Element,
    child: JSX.Element,
    show: boolean,
    onCancel?: () => void
}): JSX.Element {
    // todo add animation to dropdown
    const childRef = useRef<HTMLDivElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const windowWidthRef = useRef<number>(-1);
    useEffect(() => {
        if (childRef.current && parentRef.current && prop.show && window.innerWidth != windowWidthRef.current) {
            const child = childRef.current
            const parent = parentRef.current

            const childWidth = child.getBoundingClientRect().width
            const parentWidth = parent.getBoundingClientRect().width
            let leftOffset = childWidth / 2 - parentWidth / 2
            const lastLeftOffset = isNaN(Number.parseFloat(child.style.left)) ? 0 : Number.parseFloat(child.style.left)

            // we must first adjust them back when considering the effect of overflow
            const childRight = child.getBoundingClientRect().right - lastLeftOffset
            const windowWidth = window.innerWidth

            // put child element in the middle
            let overflow = childRight - windowWidth - leftOffset
            if (overflow > 0) {
                leftOffset = childRight - windowWidth
            }

            child.style.left = `${-(leftOffset)}px`

            windowWidthRef.current = windowWidth
        }
    });

    function handleOnCancel() {
        if (prop.onCancel) {
            prop.onCancel()
        }
    }

    const child = (
        <div ref={childRef}
             className={`absolute top-full w-fit rounded overflow-hidden ${prop.show ? 'visible' : 'hidden'}`}>
            <div className={'relative z-50 w-full'}>
                <div className={`z-50 relative w-full ${Theme.bg2}`}>
                    {prop.child}
                </div>
                <div className={'z-40 fixed'}
                     style={{width: '200vw', height: '200vh', left: '-100vw', top: '-100vh'}} onClick={handleOnCancel}>
                </div>
            </div>
        </div>
    )
    return (
        <div className={'relative h-fit w-fit'}>
            <div ref={parentRef} className={'w-fit'}>
                {prop.parent}
            </div>
            {child}
        </div>
    )
}