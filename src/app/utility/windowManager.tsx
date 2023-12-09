import React, {JSX, useState} from "react";
import {DisplayContextObj} from "@/app/model/displayContextObj";

// @ts-ignore
export const DisplayContext = React.createContext<{ displayContextObj: DisplayContextObj, updateContext: React.Dispatch<React.SetStateAction<DisplayContextObj>> } >(undefined)

export class WindowManager {
    static get ins(): WindowManager {
        return this._ins;
    }

    private static _ins: WindowManager
    static logMode: boolean = true

    private isInitiated: boolean = false

    private readonly baseZ: number = 1000
    private readonly stepZ: number = 10
    private currentZ: number = this.baseZ

    private readonly vMap: Map<string, Win> = new Map()

    private setUiDate: React.Dispatch<React.SetStateAction<Date>> | undefined

    constructor() {
        if (!WindowManager._ins) {
            WindowManager._ins = this
        }
        return WindowManager._ins
    }

    /**
     * @returns It's the caller's responsibility to pass this controller to view, if necessary
     * */
    createWindow(op: CreateWindowOp): WindowController {
        const key = op.key
        if (this.vMap.has(key)) {
            return new WindowController(key)
        }

        const win = new Win(op)

        this.vMap.set(key, win)

        this.updateUi()
        if (WindowManager.logMode) {
            console.log(`Creating window: ${key}`)
        }
        return new WindowController(key)
    }

    getController(key: string): WindowController | undefined {
        if (this.vMap.has(key)) {
            return new WindowController(key)
        } else {
            return
        }
    }

    setOnOutsideClick(key: string, f: (wc: WindowController, event: React.MouseEvent) => void): boolean {
        const win = this.vMap.get(key)
        if (win) {
            win.handleOutsideClick = f
            return true
        } else {
            return false
        }
    }

    closeWindows(...controllers: WindowController[]) {
        for (const controller of controllers) {
            this.closeWindow(controller)
        }
    }

    closeWindow(controller: WindowController) {
        const handle = controller.handle
        this.closeW(handle)
    }

    private closeW(handle: string) {
        if (this.vMap.has(handle)) {
            this.vMap.delete(handle)
            this.updateUi()
        }
    }

    private closeAll() {

    }

    private generateWindows(): JSX.Element[] {
        const ws: JSX.Element[] = []
        for (const [key, view] of this.vMap) {
            const wrappedView = this.wrapView(view)
            ws.push(wrappedView)
        }
        this.currentZ = this.baseZ
        return ws
    }

    private updateUi() {
        if (this.setUiDate) {
            this.setUiDate(new Date())
        }
    }

    private handleOutsideClick(win: Win): (event: React.MouseEvent) => void {
        return function (event: React.MouseEvent) {
            if (win.handleOutsideClick) {
                const controller = new WindowController(win.key_s)
                win.handleOutsideClick(controller, event)
            }
        }
    }

    private wrapView(win: Win): JSX.Element {
        this.currentZ += this.stepZ

        /*
        A few things to notice:
            bg-white in the second div is important, otherwise the first div background will penetrate to some elements which does not have bg color
        * */
        return (
            <div key={win.key_s}>
                <div style={{zIndex: this.currentZ, width: '100dvw', height: '100dvh'}}
                     className={`fixed top-0 left-0 cursor-default bg-black opacity-50`}
                     onClick={this.handleOutsideClick(win)}
                >
                </div>
                <div className={`-translate-x-1/2 -translate-y-1/2 fixed bg-white ${win.fullScreen ? 'w-full' : ''}
                ${win.op.rounded ? 'rounded overflow-hidden' : ''}`}
                     style={{zIndex: this.currentZ + 1, top: '50%', left: '50%'}}>
                    {win.view}
                </div>
            </div>
        )
    }

    initContext(): JSX.Element {
        const [UiDate, setUiDate] = useState(new Date())
        const [displayContextObjState, setDisplayContextObjState] = useState(new DisplayContextObj())

        displayContextObjState.setter = setDisplayContextObjState

        this.isInitiated = true
        this.setUiDate = setUiDate

        return (
            <DisplayContext.Provider
                value={{displayContextObj: displayContextObjState, updateContext: setDisplayContextObjState}}>
                <div>
                    {this.generateWindows()}
                </div>
            </DisplayContext.Provider>
        )
    }
}

export interface CreateWindowOp {
    view: JSX.Element,
    key: string
    priority?: number
    handleOutSideClick?: (wc: WindowController, event: React.MouseEvent) => void,
    fullScreen?: boolean
    background?: string
    rounded?: boolean
}

class Win {
    get op(): CreateWindowOp {
        return this._op;
    }

    get handleOutsideClick(): ((wc: WindowController, event: React.MouseEvent) => void) | undefined {
        return this.op.handleOutSideClick;
    }

    set handleOutsideClick(value: ((wc: WindowController, event: React.MouseEvent) => void) | undefined) {
        this.op.handleOutSideClick = value;
    }

    get key_s(): string {
        return this.op.key;
    }

    get view(): React.JSX.Element {
        return this.op.view;
    }

    get fullScreen(): boolean | undefined {
        return this.op.fullScreen
    }

    private readonly _cTime: Date
    private readonly _op: CreateWindowOp

    constructor(op: CreateWindowOp) {
        this._op = op

        this._cTime = new Date()
    }

    get cTime(): Date {
        return this._cTime;
    }
}

export class WindowController {
    private readonly _handle: string
    private readonly windowManager: WindowManager = new WindowManager()

    get handle(): string {
        return this._handle;
    }

    constructor(handle: string) {
        this._handle = handle;
    }

    closeWindow(): void {
        this.windowManager.closeWindow(this)
    }
}