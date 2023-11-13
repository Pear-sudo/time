import React, {JSX, useRef} from "react";
import Image from "next/image";
import plusIcon from "@/app/icons/plus.svg";
import {is} from "@babel/types";
import {isUN} from "@/app/utility/lanUtil";

export function ControlButton(): JSX.Element {
    return (
        <div className={'fixed right-2 bottom-2 rounded-full bg-fuchsia-300 hover:cursor-pointer'}
             style={{width: '6vmin', height: '6vmin'}}>
            <Image src={plusIcon} alt={''}/>
        </div>
    )
}

function NumberInput(prop: { len?: number, allowLeadingZero?: boolean }): JSX.Element {
    const oldValueRef = useRef("");

    let len = prop.len ? prop.len : 2
    let allowLeadingZero: boolean = isUN(prop.allowLeadingZero) ? true : prop.allowLeadingZero as boolean

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement
        const oldValue = oldValueRef.current
        const newValue = target.value
        let targetValue = ""

        const isNumber = /^\d*$/.test(newValue)
        const isOverflow = newValue.length > len
        const isLeadingZeroViolation = allowLeadingZero ? false : /^0/.test(newValue)
        console.log(isLeadingZeroViolation)

        if (!isNumber || isOverflow || isLeadingZeroViolation) {
            reject()
            return
        }

        accept()

        function accept() {
            targetValue = newValue
            finishUp()
        }

        function reject() {
            targetValue = oldValue
            finishUp()
        }

        function finishUp() {
            target.value = targetValue
            oldValueRef.current = targetValue
            event.preventDefault()
        }
    }

    return (
        <div className={'w-fit'}>
            <input className={'w-fit'} placeholder={'0'.repeat(len)} onChange={handleOnChange}/>
        </div>
    )
}