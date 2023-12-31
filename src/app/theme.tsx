import {Color} from "@/app/utility/color";

export class Theme {
    static button: string = "px-2 hover:bg-gray-200 focus:ring focus:ring-gray-100 rounded active:bg-gray-300 focus:outline-none cursor-pointer"
    static disabledButton: string = "px-2 focus:ring focus:ring-gray-100 rounded focus:outline-none cursor-default"
    static headerBgScrolled: string = "bg-cyan-50"
    static transition: string = "transition-colors"
    static timeAxisAddonStyle: string = 'pr-1'
    static defaultEventColor: Color = Color.setColor("Banana")
    static buttonHighlighted: string = "bg-sky-700 font-semibold text-white px-2 hover:bg-sky-500 focus:ring focus:ring-gray-100 rounded active:bg-gray-300 focus:outline-none cursor-pointer"
    static bg2: string = "bg-blue-200"
    static bg1: string = "bg-cyan-50"
}