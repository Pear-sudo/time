"use client"

import React, {useEffect} from "react";
import './index.css';
import Display from "@/app/pages/display";
import {WindowManager} from "@/app/utility/windowManager";


export default function Home() {
    useEffect(() => {
        windowManager.createWindow({view: <Display/>, key: 'root', fullScreen: true})
    }, []);
    console.log('App started.')
    const windowManager = new WindowManager()
    return (
        windowManager.initContext()
    )
}
