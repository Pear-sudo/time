import '@/app/index.css'
import {JSX} from "react";
import {Color, ColorNamesType} from "@/app/utility/color";

export function ColorList(): JSX.Element {
    const colorList: (keyof ColorNamesType)[] = ['Tomato', 'Tangerine', 'Banana']
    return (
        <div className={'inline-flex flex-col w-fit items-start'}>
            {colorList.map((color) => {
                return <ColorRow color={Color.setColor(color)} label={color}/>
            })}
        </div>
    )
}

export function ColorRow(prop: { color: Color, label: string }): JSX.Element {
    return (
        <div className={"inline-flex flex-row w-fit items-center justify-center gap-2"}>
            <div className={"rounded-full"}
                 style={{borderWidth: "4px", height: "20px", width: "20px", borderColor: prop.color.toCss()}}>
            </div>
            <div>
                {prop.label}
            </div>
        </div>
    )
}