import React, {JSX} from "react";
import {Theme} from "@/app/theme";

export function Choices(prop: {
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
            <button key={i + element} className={`relative z-50 w-full whitespace-nowrap text-sm ${Theme.button}`}
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