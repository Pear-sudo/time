import '@/app/index.css'
import {JSX} from "react";
import {Color, ColorNamesType} from "@/app/utility/color";
import {Theme} from "@/app/theme";
import {DataWrapper} from "@/app/elements/inputs/helper/inputHelper";

export function ColorList(prop: { handleSelection?: (color: Color) => void , parentData?: DataWrapper<Color>}): JSX.Element {
    const colorList: (keyof ColorNamesType)[] = ['Basil', 'Sage', 'Peacock', 'Blueberry', 'Lavender', 'Grape', 'Flamingo', 'Graphite', 'Ocean']

    function handleClick(color: Color): void {
        if (prop.handleSelection) {
            prop.handleSelection(color)
        }
        if (prop.parentData) {
            prop.parentData.setData(color)
        }
    }

    return (
        <div className={'inline-flex flex-col w-fit items-start'}>
            {colorList.map((color) => {
                return <ColorRow color={Color.setColor(color)} label={color} key={color} onclick={handleClick}/>
            })}
        </div>
    )
}

export function ColorRow(prop: { color: Color, label?: string, onclick?: (color: Color) => void }): JSX.Element {
    function handleClick() {
        if (prop.onclick) {
            prop.onclick(prop.color)
        }
    }

    return (
        <div className={`inline-flex flex-row w-fit items-center justify-center gap-2 ${Theme.button}`} onClick={handleClick}>
            <div className={"rounded-full"}
                 style={{borderWidth: "4px", height: "20px", width: "20px", borderColor: prop.color.toCss()}}>
            </div>
            <div>
                {prop.label ? prop.label : prop.color.colorName}
            </div>
        </div>
    )
}