import {ColorList} from "@/app/elements/colorList";
import {JSX} from "react";
import {WindowManager} from "@/app/utility/windowManager";

export default function Test(): JSX.Element {
    const windowManager = new WindowManager()
    const controller = windowManager.createWindow({view: <div></div>})
    controller.closeWindow()
    return (
        <ColorList/>
    )
}