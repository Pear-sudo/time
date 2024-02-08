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
    }

    keyUp(e: React.KeyboardEvent): void {
        console.log('Up: ' + e.key)
        this.activeKeys.delete(e.key)
    }

    registerKeys(keys: string[]) {

    }

    private checkKeys() {

    }
}