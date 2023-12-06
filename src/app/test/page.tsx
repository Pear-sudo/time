"use client"

import {JSX, useEffect} from "react";
import {WindowManager} from "@/app/utility/windowManager";
import {ColorList} from "@/app/elements/colorList";

export default function Test(): JSX.Element {
    useEffect(() => {
        const controller = windowManager.createWindow({
            view:
                <ColorList/>,
            key: "ttt"
        })
        // setTimeout(() => {
        //     controller.closeWindow()
        //     console.log('closing windows')
        // }, 5000)
    }, []);
    const windowManager = new WindowManager()

    return (
        <div>
            {windowManager.initContext()}
        </div>
    )
}