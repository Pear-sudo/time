import React, {JSX, useState} from "react";
import {Theme} from "@/app/theme";
import {Choices} from "@/app/elements/ui/choices";

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

    return (
        <div className={'h-full relative'}>
            <button className={`${Theme.button} h-full`} onClick={onClick}>
                {choices[index]}
            </button>
            {/* don't apply transform here, it will mess up z index in Choices */}
            <div className={'absolute top-full left-0 w-fit'}>
                <Choices elements={choices} onIndexUpdate={onIndexUpdate} visible={visible}/>
            </div>
        </div>
    )
}