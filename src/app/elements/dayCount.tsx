import React, {JSX, useState} from "react";
import {Theme} from "@/app/theme";
import {Choices} from "@/app/elements/ui/choices";
import {Dropdown} from "@/app/elements/ui/dropdown";

export function DayCount(prop: {
    onChange: (count: number) => void
}): JSX.Element {
    const [index, updateIndex] = useState(0)
    const [visible, updateVisible] = useState(false)
    const choices: string[] = ["Week", 'Day', '3 Days', '5 Days']
    const choicesN: number[] = [7, 1, 3, 5]

    function onClick() {
        updateVisible(!visible)
    }

    function onIndexUpdate(index: number): void {
        // if cancelled
        if (index === -1) {
            updateVisible(false)
            return
        }
        updateVisible(false)
        updateIndex(index)
        prop.onChange(choicesN[index])
    }

    const parent = (
        <button className={`${Theme.button} h-full`} onClick={onClick}>
            {choices[index]}
        </button>
    )

    const child = (
        <Choices elements={choices} onIndexUpdate={onIndexUpdate}/>
    )

    return (
        <Dropdown parent={parent} child={child} show={visible} onCancel={() => updateVisible(!visible)}/>
    )
}