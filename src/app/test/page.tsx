"use client"

import {JSX} from "react";
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";

export default function Test(): JSX.Element {
    return (
        <MonthlyCalendar focus={new Date()}/>
    )
}