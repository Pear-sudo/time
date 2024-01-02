import {Color} from "@/app/utility/color";

export class Theme {
    static button: string = "px-2 hover:bg-gray-200 focus:ring focus:ring-gray-100 rounded active:bg-gray-300 focus:outline-none cursor-pointer select-none"
    static disabledButton: string = "px-2 focus:none rounded cursor-default select-none"
    static buttonHighlighted: string = "bg-sky-700 font-semibold text-white px-2 hover:bg-sky-500 focus:ring focus:ring-gray-100 rounded active:bg-gray-300 focus:outline-none cursor-pointer select-none"
    static highlightCircle: string = "border-solid border-2 border-sky-700"
    static headerBgScrolled: string = "bg-cyan-50"
    static transition: string = "transition-colors"
    static timeAxisAddonStyle: string = 'pr-1'
    static defaultEventColor: Color = Color.setColor("Banana")
    static bg2: string = "bg-blue-200"
    static bg1: string = "bg-cyan-50"
}