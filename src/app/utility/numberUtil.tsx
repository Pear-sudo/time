export function padNumber(length: number, number: number): string {
    let s_number = number.toString()
    const number_len = s_number.length
    const vacant_len = length - number_len

    if (vacant_len <= 0)
        return s_number

    for (let i = 0; i < vacant_len; i++) {
        s_number = '0' + s_number
    }
    return s_number
}

function isHead(index: number, length: number): boolean {
    return index === 0
}

export function isTail(index: number, length: number): boolean {
    return index === length - 1
}

function isMiddle(index: number, length: number): boolean {
    return !isHead(index, length) && !isTail(index, length)
}