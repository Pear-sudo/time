import React, {JSX} from "react";
import {Theme} from "@/app/theme";

export function Choices(prop: {
    elements: string[],
    onIndexUpdate: (index: number) => void
}): JSX.Element {
    const elementsDivs: JSX.Element[] = []

    function onClick(index: number) {
        return (event: React.UIEvent<HTMLButtonElement>) => {
            prop.onIndexUpdate(index)
        }
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
            className={`p-1 flex flex-col w-fit`}>
            {elementsDivs}
        </div>
    )
}