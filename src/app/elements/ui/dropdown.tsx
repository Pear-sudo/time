import React, {JSX} from "react";

export function Dropdown(prop: {
    parent: JSX.Element,
    child: JSX.Element,
    show: boolean,
    onCancel?: () => void
}): JSX.Element {
    function handleOnCancel() {
        if (prop.onCancel) {
            prop.onCancel()
        }
    }

    const child = (
        <div className={'absolute top-full left-0 w-fit'}>
            <div className={'relative z-50'}>
                <div className={'z-50 relative'}>
                    {prop.child}
                </div>
                <div className={'z-40 fixed'}
                     style={{width: '200vw', height: '200vh', left: '-100vw', top: '-100vh'}} onClick={handleOnCancel}>
                </div>
            </div>
        </div>
    )
    return (
        <div className={'relative h-fit'}>
            {prop.parent}
            {prop.show ? child : undefined}
        </div>
    )
}