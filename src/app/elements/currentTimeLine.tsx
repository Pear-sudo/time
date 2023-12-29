import React, {JSX} from "react";

export function CurrentTimeLine(): JSX.Element {
    return (
        <div className={'relative w-full bg-blue-600 z-10'} style={{height: '0.1rem'}}>
            <div className={'absolute rounded-full bg-blue-600 left-0 top-1/2  -translate-x-3/4'}
                 style={{width: '0.5rem', height: '0.5rem', transform: 'translate(-50%, -50%)'}}>
            </div>
        </div>
    )
}