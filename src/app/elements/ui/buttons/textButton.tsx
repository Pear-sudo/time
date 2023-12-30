import React, {JSX} from "react";
import {Theme} from "@/app/theme";

export function TextButton(prop: {
    text: string,
    onClick?: () => void
}): JSX.Element {
    return (
        <button onClick={prop.onClick} className={`${Theme.button}`}>
            {prop.text}
        </button>
    )
}