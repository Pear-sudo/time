import {number, string} from "fp-ts";

export class Color {
    get colorName(): keyof ColorNamesType {
        return this._colorName;
    }
    private readonly r: number
    private readonly g: number
    private readonly b: number
    private readonly _colorName: keyof ColorNamesType

    constructor(r: number, g: number, b: number, colorName: keyof ColorNamesType) {
        this.r = r
        this.g = g
        this.b = b
        this._colorName = colorName
    }

    toCss(): string {
        return `rgb(${this.r},${this.g},${this.b})`
    }

    static setColor(colorName: keyof ColorNamesType): Color {
        return new Color(...(ColorNames[colorName] as RGBColor), colorName)
    }
}

export type RGBColor = [number, number, number]

export const ColorNames = {
    Black: [0, 0, 0],
    Red: [255, 0, 0],
    Tomato: [255, 99, 71],
    Tangerine: [242, 133, 0],
    Banana: [227, 207, 87],
    Basil: [88, 130, 57],
    Sage: [158, 165, 144],
    Peacock: [0, 102, 153],
    Blueberry: [44, 62, 80],
    Lavender: [181, 126, 220],
    Grape: [108, 52, 131],
    Flamingo: [252, 142, 172],
    Graphite: [60, 60, 60],
    Ocean: [28, 160, 170],
} as const;

export type ColorNamesType = typeof ColorNames