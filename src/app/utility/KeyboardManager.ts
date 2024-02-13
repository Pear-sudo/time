import React from "react";
import {Observer, Subject, Subscription} from "rxjs";

export class KeyboardManager {
    private activeKeys = new Set<string>

    constructor() {
        console.log('Initializing keyboard manager...')
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

    registerKeys(keys: string[], observer: Partial<Observer<any>>): Subscription | void {
        if (!this.verifyKeys(keys)) {
            return
        }
        const subject = new Subject<any>()
        return subject.subscribe(observer)
    }

    // We must distinguish these two types of checking. They are different, though after up checking shall not be used
    // in most cases.
    private checkKeysAfterDown() {
        this.checkKeys()
    }

    private checkKeysAfterUp() {

    }

    private checkKeys() {

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