import React, {JSX, useEffect, useId, useRef} from "react";

import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";

export function TextInput(prop: {
    label?: string,
    placeholder?: string,
    parentData?: DataWrapper<string>
}): JSX.Element {
    const id = useId()
    const inputRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (parentRef && inputRef.current) {
            const data = parentRef.getData()
            inputRef.current.value = data ? data : ""
        }
    }, []);

    const parentRef = prop.parentData

    function handleOnBlur(event: React.FocusEvent<HTMLTextAreaElement>) {
        const target = event.target
        if (parentRef) {
            parentRef.setData(target.value)
        }
    }

    return (
        <div>
            <label htmlFor={id}>{prop.label}</label>
            <textarea
                className={'resize-none w-full'}
                id={id} placeholder={prop.placeholder} onBlur={handleOnBlur} ref={inputRef} spellCheck={true}
            />
        </div>
    )
}