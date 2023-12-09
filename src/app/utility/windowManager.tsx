import React, {JSX, useState} from "react";
import {DisplayContext} from "@/app/pages/display";
import {DisplayContextObj} from "@/app/model/displayContextObj";

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

        const win = new Win(op.view, key)
        win.handleOutsideClick = op.handleOutSideClick
        win.fullScreen = op.fullScreen

        this.vMap.set(key, win)

        this.updateUi()
        if (WindowManager.logMode) {
            console.log(`Creating window: ${key}`)
        }
        return new WindowController(key)
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

    private handleOutsideClick(win: Win): () => void {
        return function () {
            if (win.handleOutsideClick) {
                const controller = new WindowController(win.key_s)
                win.handleOutsideClick(controller)
            }
        }
    }

    private wrapView(view: Win): JSX.Element {
        this.currentZ += this.stepZ
        return (
            <div key={view.key_s}>
                <div style={{zIndex: this.currentZ, width: '100dvw', height: '100dvh'}}
                     className={'fixed top-0 left-0 cursor-default'}
                     onClick={this.handleOutsideClick(view)}
                >
                </div>
                <div className={`-translate-x-1/2 -translate-y-1/2 fixed ${view.fullScreen ? 'w-full' : ''}`}
                     style={{zIndex: this.currentZ + 1, top: '50%', left: '50%'}}>
                    {view.view}
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
    handleOutSideClick?: (wc: WindowController) => void,
    fullScreen?: boolean
}

class Win {
    get handleOutsideClick(): ((wc: WindowController) => void) | undefined {
        return this._handleOutsideClick;
    }

    set handleOutsideClick(value: ((wc: WindowController) => void) | undefined) {
        this._handleOutsideClick = value;
    }

    get key_s(): string {
        return this._key_s;
    }

    get view(): React.JSX.Element {
        return this._view;
    }

    private readonly _view: JSX.Element
    private readonly _cTime: Date
    private readonly _key_s: string
    private _handleOutsideClick?: ((wc: WindowController) => void) | undefined
    fullScreen?: boolean

    constructor(view: React.JSX.Element, key: string) {
        this._view = view;
        this._key_s = key

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