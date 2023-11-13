import React, {JSX, useRef, useState} from "react";
import Image from "next/image";
import plusIcon from "@/app/icons/plus.svg";
import {is} from "@babel/types";
import {isUN} from "@/app/utility/lanUtil";
import {toNumber} from "lodash";

export function ControlButton(): JSX.Element {
    const [showCreator, updateShowCreator] = useState(false);

    function handleOnClick() {
        updateShowCreator(true)
    }

    function handleCallback(result: PopupResult, data: any) {
        if (result == PopupResult.Cancelled) {
            updateShowCreator(false)
        }
    }

    return (
        <div className={'fixed right-2 bottom-2 rounded-full bg-fuchsia-300 hover:cursor-pointer'}
             style={{width: '6vmin', height: '6vmin'}}
             onClick={handleOnClick}
        >
            <Image src={plusIcon} alt={''}/>
            {showCreator ? <LogCreator callback={handleCallback}/> : null}
        </div>
    )
}

function NumberInput(prop: { len?: number, allowLeadingZero?: boolean, min?: number, max?: number }): JSX.Element {
    const oldValueRef = useRef("");

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
        console.log(signViolation)

        let rangeViolation = false
        if (num != undefined) {
            rangeViolation = num > max || num < min
        }

        if (!isNumber || isOverflow || leadingZeroViolation || rangeViolation || signViolation) {
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
        <span className={'w-fit'}>
            <input type={'text'} inputMode={"numeric"} className={'w-10 text-center'}
                   style={{
                       WebkitAppearance: 'none',
                       MozAppearance: 'textfield'
                   }}
                   placeholder={'0'.repeat(len)} onChange={handleOnChange}/>
        </span>
    )
}


function LogCreator(prop: { callback: (result: PopupResult, data: any) => void }): JSX.Element {
    function handleOutsideClick(event: React.MouseEvent) {
        event.stopPropagation()
        prop.callback(PopupResult.Cancelled, undefined)
    }

    return (
        <div>
            <div className={'fixed bg-black top-0 left-0 cursor-default opacity-50'}
                 style={{width: '100dvw', height: '100dvh'}}
                 onClick={handleOutsideClick}></div>
            <div className={'fixed bg-cyan-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-default'}
                 style={{width: '50dvw', height: '50dvh'}}>
                <span>
                    Begin: <TimeSelector/>
                </span>
                <br/>
                <span>
                    End: <TimeSelector/>
                </span>
            </div>
        </div>
    )
}

function TimeSelector(): JSX.Element {
    return (
        <span>
            <NumberInput max={23} min={0} allowLeadingZero={true}/>
            :
            <NumberInput max={59} min={0} allowLeadingZero={true}/>
        </span>
    )
}

enum PopupResult {
    Cancelled,
    Success
}