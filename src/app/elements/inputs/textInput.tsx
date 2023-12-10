import React, {JSX, useEffect, useId, useRef} from "react";

import {RefClass} from "@/app/elements/inputs/helper/inputHelper";
import {StringWrapper} from "@/app/utility/lanUtil";

export function TextInput(prop: {
    label?: string,
    placeholder?: string,
    parentRef?: RefClass<string>
}): JSX.Element {
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (parentRef && inputRef.current) {
            const data = parentRef.getData()
            inputRef.current.value = data ? data : ""
        }
    }, []);

    const parentRef = prop.parentRef

    function handleOnBlur(event: React.FocusEvent<HTMLInputElement>) {
        const target = event.target
        if (parentRef) {
            parentRef.setData(target.value)
        }
    }

    return (
        <div>
            <label htmlFor={id}>{prop.label}</label>
            <input id={id} type={'text'} placeholder={prop.placeholder} onBlur={handleOnBlur} ref={inputRef}/>
        </div>
    )
}