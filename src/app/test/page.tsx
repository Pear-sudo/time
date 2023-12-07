"use client"

import {JSX, useEffect} from "react";
import {WindowController, WindowManager} from "@/app/utility/windowManager";
import {ColorList} from "@/app/elements/colorList";

export default function Test(): JSX.Element {
    useEffect(() => {
        create()
        create()
        // setTimeout(() => {
        //     controller.closeWindow()
        //     console.log('closing windows')
        // }, 5000)
    }, []);
    const windowManager = new WindowManager()
    function handleOutsideClick(wc: WindowController) {
        console.log('click')
        wc.closeWindow()
    }

    function create() {
        const controller = windowManager.createWindow({
            view:
                <ColorList/>,
            key: new Date().valueOf().toString(),
            handleOutSideClick: handleOutsideClick
        })
    }

    return (
        <div>
            {windowManager.initContext()}
        </div>
    )
}