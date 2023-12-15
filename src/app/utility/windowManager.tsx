import React, {JSX, useMemo, useRef, useState} from "react";
import {DisplayContextObj} from "@/app/model/displayContextObj";
import {boolean, number, string} from "fp-ts";
import {String} from "postcss-selector-parser";

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

    private generateHandleOutsideClick(win: Win): (event: React.MouseEvent) => void {
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
            <WindowView win={win} z={this.currentZ} handleOutsideClick={this.generateHandleOutsideClick(win)} key={win.key_s}/>
        )
    }

    private Context(): JSX.Element {
        const [UiDate, setUiDate] = useState(new Date())
        this.setUiDate = setUiDate

        return (
            <div>
                {this.generateWindows()}
            </div>
        )
    }

    initContext(): JSX.Element {
        const [displayContextObjState, setDisplayContextObjState] = useState(new DisplayContextObj())

        displayContextObjState.setter = setDisplayContextObjState

        const contextValue = useMemo(() => {
            console.log('Creating context value.')
            return {displayContextObj: displayContextObjState, updateContext: setDisplayContextObjState}
        }, [displayContextObjState])

        this.isInitiated = true

        return (
            <DisplayContext.Provider
                value={contextValue}>
                {this.Context()}
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
    header?: boolean
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

    private _top: string = "50%"
    private _left: string = "50%"

    get top(): string {
        return this._top;
    }

    get left(): string {
        return this._left;
    }

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

function WindowView(prop: { win: Win, z: number, handleOutsideClick: (event: React.MouseEvent) => void  }): JSX.Element {
    const [top, setTop] = useState(prop.win.top)
    const [left, setLeft] = useState(prop.win.left)

    const win = prop.win
    const z = prop.z
    return (
        <div>
            <div style={{zIndex: z, width: '100dvw', height: '100dvh'}}
                 className={`fixed top-0 left-0 cursor-default bg-black opacity-50`}
                 onClick={prop.handleOutsideClick}
            >
            </div>
            <div className={`-translate-x-1/2 -translate-y-1/2 fixed bg-white ${win.fullScreen ? 'w-full' : ''}
                ${win.op.rounded ? 'rounded overflow-hidden' : ''}`}
                 style={{zIndex: z + 1, top: win.top, left: win.left}}>
                {win.op.header ? <WindowHeader win={win}></WindowHeader> : undefined}
                {win.view}
            </div>
        </div>
    )
}

function WindowHeader(prop: { win: Win }): JSX.Element {
    const win = prop.win

    function handleOnClick() {
    }

    return (
        <div className={'w-full h-4 bg-gray-400 cursor-move'} onClick={handleOnClick}>

        </div>
    )
}