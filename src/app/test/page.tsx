"use client"

import {JSX} from "react";
import '@/app/index.css';
import {MonthlyCalendar} from "@/app/elements/monthlyCalendar";

export default function Test(): JSX.Element {
    return (
        <MonthlyCalendar focus={new Date()}/>
    )
}