import React from "react";

export class KeyboardManager {
    private activeKeys = new Set<string>

    constructor() {
        console.log('Initializing keyboard manager...')
    }

    keyDown(e: React.KeyboardEvent): void {
        if (e.repeat) {
            return
        }
        console.log('Down: ' + e.key)
        this.activeKeys.add(e.key)
        this.checkKeysAfterDown()
    }

    keyUp(e: React.KeyboardEvent): void {
        console.log('Up: ' + e.key)
        this.activeKeys.delete(e.key)
        this.checkKeysAfterUp()
    }

    registerKeys(keys: string[]) {

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