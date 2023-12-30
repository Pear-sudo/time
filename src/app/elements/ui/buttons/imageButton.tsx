import React, {JSX} from "react";
import {isUN} from "@/app/utility/lanUtil";
import {Theme} from "@/app/theme";
import Image from "next/image";

export function ImageButton(prop: {
    src: string,
    width?: number,
    height?: number,
    className?: string,
    onClick?: () => void
}): JSX.Element {
    let width = prop.width
    let height = prop.height
    if (isUN(width))
        width = 32
    if (isUN(height))
        height = 32
    return (
        <button className={`inline ${Theme.button} rounded-full`} onClick={prop.onClick}>
            <Image src={prop.src} alt={''} width={width} height={height}
                   className={`cursor-pointer ${prop.className}`}/>
        </button>
    )
}