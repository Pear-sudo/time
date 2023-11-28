import {rollDate} from "../src/app/utility/timeUtil";

test('roll date', () => {
    const d = new Date()
    d.setFullYear(2023, 11, 27)
    const rolledDate = rollDate(d, {year: 1, month: 2})
    expect(rolledDate.getFullYear()).toBe(2025)
    expect(rolledDate.getMonth()).toBe(1)
})

test('roll date reverse', () => {
    const d = new Date()
    d.setFullYear(2023, 11, 27)
    d.setHours(0, 0, 0, 0)
    const rolledDate = rollDate(d, {millisecond: -1})
    expect(rolledDate.getDate()).toBe(26)
    expect(rolledDate.getMilliseconds()).toBe(999)
})