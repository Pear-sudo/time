import React from "react";

export class RefClass<T> implements DataWrapper<T>, DataInterception<T> {
    private ref: React.MutableRefObject<T>;

    constructor(ref: React.MutableRefObject<T>,
                callbacks?: {
                    willSet?: (newValue: T, oldValue: T) => void | undefined | T,
                    didSet?: (newValue: T, oldValue: T) => void | undefined | T
                }) {
        this.ref = ref;
        if (callbacks?.willSet) {
            this.willSet = callbacks.willSet
        }
        if (callbacks?.didSet) {
            this.didSet = callbacks.didSet
        }
    }

    getData(): T {
        return this.ref?.current;
    }

    setData(newValue: T): void {
        const oldValue = this.ref.current
        this.willSet(newValue, oldValue)
        this.ref.current = newValue
        this.didSet(newValue, oldValue)
    }

    didSet(newValue: T, oldValue: T): void | undefined | T {
        return undefined;
    }

    willSet(newValue: T, oldValue: T): void | undefined | T {
        return undefined;
    }

}

export class StateClass<T> implements DataWrapper<T>, DataInterception<T> {
    private state: T
    private readonly stateSetter: React.Dispatch<React.SetStateAction<T>>

    constructor(state: T,
                stateSetter: React.Dispatch<React.SetStateAction<T>>,
                callbacks?: {
                    willSet?: (newValue: T, oldValue: T) => void | undefined | T,
                    didSet?: (newValue: T, oldValue: T) => void | undefined | T
                }) {
        this.state = state
        this.stateSetter = stateSetter
        if (callbacks?.willSet) {
            this.willSet = callbacks.willSet
        }
        if (callbacks?.didSet) {
            this.didSet = callbacks.didSet
        }
    }

    getData(): T {
        return this.state;
    }

    setData(newValue: T): void {
        const oldValue = this.state
        this.willSet(newValue, oldValue)
        this.stateSetter(newValue)
        this.state = newValue
        this.didSet(newValue, oldValue)
    }

    didSet(newValue: T, oldValue: T): void | undefined | T {
        return undefined;
    }

    willSet(newValue: T, oldValue: T): void | undefined | T {
        return undefined;
    }
}

export interface DataWrapper<T> {
    getData: () => T;
    setData: (data: T) => void
}

export interface DataInterception<T> {
    willSet: (newValue: T, oldValue: T) => T | undefined | void,
    didSet: (newValue: T, oldValue: T) => T | undefined | void
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