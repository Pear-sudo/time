export function isUN(v: any): boolean {
    return v === null || v === undefined;
}

export function arraysEqual<T>(a: T[], b: T[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    a.sort();
    b.sort();

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function isOrAre(count: number): string {
    if (count <= 1) {
        return 'is'
    } else {
        return 'are'
    }
}

export function initObject<T extends Object, K extends keyof T>(keys: K[], obj: T, defaultValue: any): Required<T> {
    for (const key of keys) {
        const value = obj[key]
        if (value == undefined) {
            obj[key] = defaultValue
        }
    }
    return obj as Required<T>
}

export class StringWrapper {
    public value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export function genNums(op: { count: number, from?: number, step?: number, to?: number }): number[] {
    let l: number[] = []
    let count = op.count
    if (op.count <= 0) {
        return l
    }
    for (let i = op.from ?? 1; i <= (op.to ?? Number.MAX_SAFE_INTEGER) && count > 0; i += op.step ?? 1) {
        l.push(i)
        count--
    }
    return l
}