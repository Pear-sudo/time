import React, {JSX} from "react";
import {ImageButton} from "@/app/elements/ui/buttons/imageButton";
import arrowPrev from "@/app/icons/arrow-prev-small.svg";
import arrowNext from "@/app/icons/arrow-next-small.svg";

export function NavigationButtons(prop: {
    onClick: (nextPeriod: boolean) => void
}): JSX.Element {

    return (
        <div className={'inline-flex flex-row'}>
            <ImageButton src={arrowPrev} className={''} onClick={() => prop.onClick(false)}/>
            <ImageButton src={arrowNext} className={''} onClick={() => prop.onClick(true)}/>
        </div>
    )
}