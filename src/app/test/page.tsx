"use client"

import {JSX} from "react";
import '@/app/index.css';
import {AdvancedDateSelector} from "@/app/elements/inputs/advancedDateSelector";

export default function Test(): JSX.Element {
    return (
        <div>
            <AdvancedDateSelector/>
        </div>
    )
}