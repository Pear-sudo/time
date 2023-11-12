import React, {JSX} from "react";
import {Theme} from "@/app/theme";

export function TodayButton(prop: {
    onClick?: () => void
}): JSX.Element {
    return (
        <button onClick={prop.onClick} className={`${Theme.button}`}>
            Today
        </button>
    )
}