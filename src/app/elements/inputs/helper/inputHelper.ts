import React from "react";

export class RefClass<T> implements DataWrapper<T | undefined> {
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

export class StateClass<T> implements DataWrapper<T>, DataInterception<T> {
    private readonly state: T
    private readonly stateSetter: React.Dispatch<React.SetStateAction<T>>

    constructor(state: T, stateSetter: React.Dispatch<React.SetStateAction<T>>) {
        this.state = state
        this.stateSetter = stateSetter
    }

    getData(): T {
        return this.state;
    }

    setData(data: T): void {
        this.stateSetter(data)
        this.afterSet(data)
    }

    afterSet(data: T): void {
    }
}

export interface DataWrapper<T> {
    getData: () => T;
    setData: (data: T) => void
}

export interface DataInterception<T> {
    afterSet: (data: T) => void
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