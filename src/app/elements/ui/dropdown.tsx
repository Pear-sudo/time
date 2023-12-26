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
        <div className={`absolute top-full left-0 w-fit rounded overflow-hidden ${prop.show ? 'visible' : 'hidden'}`}>
            <div className={'relative z-50 w-fit'}>
                <div className={'z-50 relative w-fit'}>
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
            {prop.parent}
            {child}
        </div>
    )
}