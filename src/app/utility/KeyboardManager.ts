import React from "react";
import {Observer, Subject, Subscription} from "rxjs";

export class KeyboardManager {
    private activeKeys = new Set<string>
    private keyRegistry: Map<MapKey, Subject<KeyProto>> = new Map()
    private _currentWindow: string = ''

    constructor() {
        console.log('Initializing keyboard manager...')
    }

    set currentWindow(key: string) {
        this._currentWindow = key
    }

    get currentWindow(): string {
        return this._currentWindow
    }

    keyDown(e: React.KeyboardEvent): void {
        if (e.repeat) {
            return
        }
        this.activeKeys.add(e.key)
        this.checkKeysAfterDown()
    }

    keyUp(e: React.KeyboardEvent): void {
        this.activeKeys.delete(e.key)
        this.checkKeysAfterUp()
    }

    registerKeys(keys: string[], observer: Partial<Observer<any>>, scope: string | undefined = undefined): Subscription | void {
        if (!this.verifyKeys(keys)) {
            return
        }

        const keyHash = this.hashKeys(keys)
        const mapKey: MapKey = {keyHash: keyHash, scope: scope}

        let subject = this.getSubject(keys)
        if (subject == undefined) {
            subject = new Subject<KeyProto>()
            this.keyRegistry.set(mapKey, subject)
        }
        return subject.subscribe(observer)
    }

    // We must distinguish these two types of checking. They are different, though after up checking shall not be used
    // in most cases.
    private checkKeysAfterDown() {
        this.checkKeys()
    }

    private checkKeysAfterUp() {
        // just ignore this for now since this use case does not make much sense in practice
    }

    private checkKeys() {
        const subject = this.getSubject(this.activeKeys)
        if (subject != undefined) {
            subject.next({keys: this.activeKeys})
        }
    }

    verifyKeys(keys: string[]): boolean {
        for (const key in keys) {
            if (!this.verifyKey(key)) {
                return false
            }
        }
        return true
    }

    verifyKey(key: string): boolean {
        if (key.length !== 1) {
            return false
        }
        const validKeyRegex = /^[a-zA-Z0-9 `~!@#$%^&*()\-_=+\[\]{}\\|;:'",.<>\/?]+$/;
        return validKeyRegex.test(key)
    }

    hashKeys(keys: string[] | Set<string>): string {
        keys = Array.isArray(keys) ? keys : Array.from(keys)
        return keys.sort().join('\n')
    }

    private getSubject(keys: string[] | Set<string>) {
        const mapKey = this.constructMapKey(keys)
        return this.keyRegistry.get(mapKey)
    }

    private constructMapKey(keys: string[] | Set<string>): MapKey {
        const keyHash = this.hashKeys(keys)
        return {keyHash: keyHash, scope: this.currentWindow}
    }
}

interface KeyProto {
    keys: Set<string>
}

interface MapKey {
    keyHash: string,
    scope: string | undefined
}

export type SpecialKey =
    'Control'
    | 'Shift'
    | 'Alt'
    | 'Enter'
    | 'Escape'
    | 'Meta'
    | 'Backspace'
    | 'Delete'
    | 'CapsLock'
    | 'Tab'
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'