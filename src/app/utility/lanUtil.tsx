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