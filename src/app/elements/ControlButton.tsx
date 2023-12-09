import React, {JSX, useRef} from "react";
import Image from "next/image";
import plusIcon from "@/app/icons/plus.svg";
import {LogCreatorWrapper} from "@/app/elements/calendarEventCreator";

export function ControlButton(): JSX.Element {
    return (
        <div className={'fixed right-2 bottom-2 rounded-full bg-fuchsia-300 hover:cursor-pointer'}
             style={{width: '6vmin', height: '6vmin'}}
        >
            <Image src={plusIcon} alt={''}/>
            <LogCreatorWrapper/>
        </div>
    )
}