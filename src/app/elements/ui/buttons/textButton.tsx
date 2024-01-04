import React, {JSX} from "react";
import {Theme} from "@/app/theme";


export function TextButton(prop: {
    text: string,
    highlight?: boolean,
    focused?: boolean,
    onClick?: () => void
}): JSX.Element {
    let theme = Theme.button
    if (prop.highlight)
        theme = Theme.buttonHighlighted
    else if (prop.focused)
        theme = Theme.buttonFocused

    return (
        <button onClick={prop.onClick} className={theme}>
            {prop.text}
        </button>
    )
}