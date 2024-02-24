import React from "react";
import {Observer, Subject, Subscription} from "rxjs";

export class KeyboardManager {
    private activeKeys = new Set<string>
    private keyRegistry: Map<string, Subject<KeyProto>> = new Map()
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
        let subject = this.getSubject(keys)
        if (subject == undefined) {
            subject = new Subject<KeyProto>()
            this.keyRegistry.set(keyHash, subject)
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
        const keyHash = this.hashKeys(keys)
        return this.keyRegistry.get(keyHash)
    }
}

interface KeyProto {
    keys: Set<string>
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