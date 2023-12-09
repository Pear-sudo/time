import React from "react";

export class RefClass<T> {
    private ref: React.MutableRefObject<T | undefined>;

    constructor(ref: React.MutableRefObject<T | undefined>) {
        this.ref = ref;
    }

    getData(): T | undefined {
        return this.ref?.current;
    }

    setData(data: T | undefined): void {
        this.ref.current = data
    }

}

export enum PopupResult {
    Cancelled,
    Success,
    Delete
}

export class PropWrapper<T> {
    get prop(): T {
        return this._prop;
    }

    private _prop: T;

    constructor(prop: T) {
        this._prop = prop
    }

}