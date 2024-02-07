import React, {JSX, useEffect, useRef, useState} from "react";
import {isUN} from "@/app/utility/lanUtil";
import {toNumber} from "lodash";

export function NumberInput(prop: {
    callback: (num: number | undefined) => void,
    value?: number,
    len?: number,
    allowLeadingZero?: boolean,
    min?: number,
    max?: number
}): JSX.Element {
    const oldValueRef = useRef(prop.value == undefined ? "" : prop.value.toString());
    const [value, setValue] = useState(oldValueRef.current)
    const hintRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (prop.value != null) {
            // never write if (prop.value); it will fail when prop.value is 0
            setValue(prop.value.toString())
        }
    }, [prop.value]);

    let len = prop.len ? prop.len : 2
    let allowLeadingZero: boolean = isUN(prop.allowLeadingZero) ? true : prop.allowLeadingZero as boolean
    let min = prop.min != undefined ? prop.min : -Infinity
    let max = prop.max != undefined ? prop.max : Infinity

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement
        const oldValue = oldValueRef.current
        const newValue = target.value
        let targetValue = ""

        const isNumber = /^-?\d*$/.test(newValue)
        let num: number | undefined
        if (isNumber) {
            num = toNumber(newValue)
        }
        const isOverflow = newValue.replace(/^-?/, "").length > len
        const leadingZeroViolation = allowLeadingZero ? false : /^-?0/.test(newValue)

        let signViolation = false
        const hasSign = /^-/.test(newValue)
        signViolation = min >= 0 ? hasSign : !hasSign

        // If min is 2000, the first input 2 should be accepted
        // let rangeViolation = false
        // if (num != undefined) {
        //     rangeViolation = num > max || num < min
        // }

        if (!isNumber || isOverflow || leadingZeroViolation || signViolation) {
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
            oldValueRef.current = targetValue
            setValue(targetValue)
            event.preventDefault()
        }
    }

    function handleOnBlur(event: React.FocusEvent<HTMLInputElement>) {
        const targetValue = event.target.value
        const targetNum = toNumber(targetValue)
        if (targetValue !== "" && (targetNum < min || targetNum > max)) {
            if (hintRef.current) {
                hintRef.current.innerText = `${targetValue} is not within the range ${min} to ${max}`
            }
        } else {
            if (hintRef.current && hintRef.current.innerText !== "") {
                hintRef.current.innerText = ""
            }
            prop.callback(toNumber(oldValueRef.current))
        }
    }

    function handleOnFocus(event: React.FocusEvent<HTMLInputElement>) {
        event.target.select()
    }

    return (
        <span className={'w-fit flex-col inline-flex items-center'}>
            <input type={'text'}
                   inputMode={"numeric"}
                   className={'w-10 text-center'}
                   style={{
                       WebkitAppearance: 'none',
                       MozAppearance: 'textfield'
                   }}
                   placeholder={'0'.repeat(len)} onChange={handleOnChange}
                   onBlur={handleOnBlur}
                   onFocus={handleOnFocus}
                   value={value}
            />
            <span className={'text-red-600 text-sm'} ref={hintRef}></span>
        </span>
    )
}