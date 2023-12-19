"use client"

import {JSX} from "react";
import '@/app/index.css';
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";
import {Dropdown} from "@/app/elements/ui/dropdown";

export default function Test(): JSX.Element {
    return (
        <div>
            <Dropdown child={<MonthlyCalendar anchor={new Date()}/>} parent={<div>Test</div>} show={false}/>
        </div>
    )
}