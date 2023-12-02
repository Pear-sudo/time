export class Color {
    private readonly r: number
    private readonly g: number
    private readonly b: number

    constructor(r: number, g: number, b: number) {
        this.r = r
        this.g = g
        this.b = b
    }

    toCss(): string {
        return `rgb(${this.r},${this.g},${this.b})`
    }

    static setColor(colorName: keyof ColorNamesType): Color {
        return new Color(...(ColorNames[colorName] as RGBColor))
    }
}

export type RGBColor = [number, number, number]

export const ColorNames = {
    Black: [0, 0, 0],
    Red: [255, 0, 0],
    Tomato: [255, 99, 71],
    Tangerine: [242, 133, 0],
    Banana: [227, 207, 87]
} as const

export type ColorNamesType = typeof ColorNames