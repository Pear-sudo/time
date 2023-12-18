import React, {JSX} from "react";

export function Dropdown(prop: {parent: JSX.Element, child: JSX.Element, show: boolean}): JSX.Element {
    const child = (
        <div className={'absolute top-full left-0 w-fit z-50'}>
            {prop.child}
        </div>
    )
    return (
        <div className={'relative'}>
            <div>
                {prop.parent}
            </div>
            {prop.show ? child : undefined}
        </div>
    )
}