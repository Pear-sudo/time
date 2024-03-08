import React, {JSX, useEffect, useMemo, useRef, useState} from "react";
import {DisplayContextObj} from "@/app/model/displayContextObj";
import {genNums} from "@/app/utility/lanUtil";
import {KeyboardManager} from "@/app/utility/KeyboardManager";
import {Observer, Subscription} from "rxjs";

// @ts-ignore
export const DisplayContext = React.createContext<{ displayContextObj: DisplayContextObj, updateContext: React.Dispatch<React.SetStateAction<DisplayContextObj>> } >(undefined)

// todo add support for global and window wise keyboard shortcut management
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
    private _focusedWindow: Win | undefined

    private setUiDate: React.Dispatch<React.SetStateAction<Date>> | undefined

    // I only need one global keyboard manager; though end user can init their own km.
    // So singleton pattern is not at km level but here.
    private static keyboardManager = new KeyboardManager()

    constructor() {
        if (!WindowManager._ins) {
            WindowManager._ins = this
        }
        return WindowManager._ins
    }

    private set focusedWindow(w: Win) {
        this._focusedWindow = w
        WindowManager.keyboardManager.currentWindow = w.key_s
    }

    private get focusedWindow(): Win | undefined {
        return this._focusedWindow
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
        this.focusedWindow = win

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
            const count = this.vMap.size
            if (count > 0) {
                this.focusedWindow = Array.from(this.vMap.values())[count - 1]
            }
        }
    }

    private closeAll() {

    }

    registerKeys(controller: WindowController, keys: string[], observer: Partial<Observer<any>>): Subscription | void {
        WindowManager.keyboardManager.registerKeys(keys, observer, controller.handle)
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
            <WindowView win={win} z={this.currentZ} handleOutsideClick={this.generateHandleOutsideClick(win)}
                        key={win.key_s}/>
        )
    }

    private Context(): JSX.Element {
        const rootRef = useRef<HTMLDivElement>(null);
        // This is used to update the whole window manager; its value is useless
        const [UiDate, setUiDate] = useState(new Date())
        useEffect(() => {
            return this.registerWindowHeaderActivation()
        });
        useEffect(() => {
            if (rootRef.current) {
                // focus the root element to capture all keystrokes (it is not focused by default)
                rootRef.current.focus()
            }
        }, []);
        this.setUiDate = setUiDate

        /* handle all key events in the root element; do not intercept keystroke at each window level
        * since the user can implement this easily by themselves */
        return (
            <div tabIndex={0} onKeyDown={this.handleOnKeyDown} onKeyUp={this.handleOnKeyUp} ref={rootRef}>
                {this.generateWindows()}
            </div>
        )
    }

    private handleOnKeyDown(e: React.KeyboardEvent) {
        WindowManager.keyboardManager.keyDown(e)
    }

    private handleOnKeyUp(e: React.KeyboardEvent) {
        WindowManager.keyboardManager.keyUp(e)
    }

    private registerWindowHeaderActivation() {
        const focused = Array.from(this.vMap.values()).pop()
        let mouseCallback: (() => void) | undefined
        let touchCallback: (() => void) | undefined

        if (focused && focused.windowHeaderActivation) {
            let activationRef = focused.windowHeaderActivation

            function handleMouseUpGlobal() {
                if (activationRef.current) {
                    activationRef.current = false;
                }
            }

            function handleOnMouseMoveGlobal(e: MouseEvent) {
                if (activationRef.current && focused) {
                    focused.topDelta(e.movementY)
                    focused.leftDelta(e.movementX)
                }
            }

            window.addEventListener('mouseup', handleMouseUpGlobal);
            window.addEventListener('mousemove', handleOnMouseMoveGlobal)

            mouseCallback = () => {
                window.removeEventListener('mouseup', handleMouseUpGlobal);
                window.removeEventListener('mousemove', handleOnMouseMoveGlobal)
            };
        }

        if (focused && focused.windowHeaderTouching) {
            let touchingRef = focused.windowHeaderTouching

            function handleTouchEndGlobal() {
                if (touchingRef.current) {
                    touchingRef.current = false
                    if (focused) {
                        focused.clearScreen()
                    }
                }
            }

            function handleTouchMoveGlobal(e: TouchEvent) {
                if (touchingRef.current && focused) {
                    const touch = e.touches[0]
                    focused.setScreenX(touch.screenX)
                    focused.setScreenY(touch.screenY)
                }
            }

            window.addEventListener('touchend', handleTouchEndGlobal);
            window.addEventListener('touchmove', handleTouchMoveGlobal)

            touchCallback = () => {
                window.removeEventListener('touchend', handleTouchEndGlobal);
                window.removeEventListener('touchmove', handleTouchMoveGlobal)
            };
        }

        return () => {
            if (mouseCallback) {
                mouseCallback()
            }
            if (touchCallback) {
                touchCallback()
            }
        };

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
    // for internal use only
    get topSetter(): React.Dispatch<React.SetStateAction<string>> | undefined {
        return this._topSetter;
    }

    get leftSetter(): React.Dispatch<React.SetStateAction<string>> | undefined {
        return this._leftSetter;
    }

    set topSetter(value: React.Dispatch<React.SetStateAction<string>> | undefined) {
        this._topSetter = value;
    }

    set leftSetter(value: React.Dispatch<React.SetStateAction<string>> | undefined) {
        this._leftSetter = value;
    }

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

    windowHeaderActivation: React.MutableRefObject<boolean> | undefined
    windowHeaderTouching: React.MutableRefObject<boolean> | undefined

    private readonly _cTime: Date
    private readonly _op: CreateWindowOp

    private _top: number = 0.5
    private _left: number = 0.5
    private _topSetter: React.Dispatch<React.SetStateAction<string>> | undefined
    private _leftSetter: React.Dispatch<React.SetStateAction<string>> | undefined

    private screenY: number | undefined
    private screenX: number | undefined

    get top(): string {
        return this._top * 100 + '%';
    }

    get left(): string {
        return this._left * 100 + '%';
    }

    private set top(top: number) {
        this._top = top
        if (this.topSetter) {
            this.topSetter(this.top)
        }
    }

    private set left(left: number) {
        this._left = left
        if (this.leftSetter) {
            this.leftSetter(this.left)
        }
    }

    topDelta(pixel: number) {
        const percentageDelta = pixel / window.innerHeight
        this.top = this._top + percentageDelta
    }

    leftDelta(pixel: number) {
        const percentageDelta = pixel / window.innerWidth
        this.left = this._left + percentageDelta
    }

    setScreenY(y: number) {
        if (this.screenY == undefined) {
            this.screenY = y
            return
        }
        this.topDelta(y - this.screenY)
        this.screenY = y
    }

    setScreenX(x: number) {
        if (this.screenX == undefined) {
            this.screenX = x
            return
        }
        this.leftDelta(x - this.screenX)
        this.screenX = x
    }

    clearScreen() {
        this.screenX = undefined
        this.screenY = undefined
    }

    constructor(op: CreateWindowOp) {
        this._op = op

        this._cTime = new Date()
    }

    get cTime(): Date {
        return this._cTime;
    }

    getController() {
        return new WindowController(this.key_s)
    }
}

export class WindowController {
    // for external control
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

    registerKeys(keys: string[], observer: Partial<Observer<any>>): Subscription | void {
        this.windowManager.registerKeys(this, keys, observer)
    }
}

function WindowView(prop: { win: Win, z: number, handleOutsideClick: (event: React.MouseEvent) => void }): JSX.Element {
    // todo make window resizable, if that's what the user wants
    const [top, setTop] = useState(prop.win.top)
    const [left, setLeft] = useState(prop.win.left)

    const win = prop.win
    win.topSetter = setTop
    win.leftSetter = setLeft
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
    const isMouseDownRef = useRef(false)
    const isTouching = useRef(false)

    const win = prop.win
    win.windowHeaderActivation = isMouseDownRef
    win.windowHeaderTouching = isTouching

    function handleOnMouseDown() {
        isMouseDownRef.current = true
    }

    function onTouchStart() {
        isTouching.current = true
    }

    return (
        <div className={'w-full h-4 bg-gray-400 cursor-move grid grid-cols-3 items-center'}
             onMouseDown={handleOnMouseDown}
             onTouchStart={onTouchStart}>
            <TrafficLights win={win}/>
            <ThreeDots/>
        </div>
    )
}

function TrafficLights(prop: { win: Win }): JSX.Element {
    const win = prop.win
    return (
        <div className={'h-1/2 flex gap-0.5'}>
            <TrafficLightRed win={win}/>
            <TrafficLightYellow win={win}/>
            <TrafficLightGreen win={win}/>
        </div>
    )
}

function TrafficLightRed(prop: { win: Win, disable?: boolean }): JSX.Element {
    const win = prop.win

    function handleOnClick() {
        win.getController().closeWindow()
    }

    return (
        <div
            className={`rounded-full ${prop.disable ? 'bg-gray-600' : 'bg-red-600'} h-full aspect-square cursor-default`}
            onClick={handleOnClick}>

        </div>
    )
}

function TrafficLightYellow(prop: { win: Win, disable?: boolean }): JSX.Element {
    const win = prop.win
    return (
        <div
            className={`rounded-full ${prop.disable ? 'bg-gray-600' : 'bg-yellow-600'} h-full aspect-square cursor-default`}>

        </div>
    )
}

function TrafficLightGreen(prop: { win: Win, disable?: boolean }): JSX.Element {
    const win = prop.win
    return (
        <div
            className={`rounded-full ${prop.disable ? 'bg-gray-600' : 'bg-green-600'} h-full aspect-square cursor-default`}>

        </div>
    )
}

function ThreeDots(prop: {}): JSX.Element {
    // mimic iOS's window manager
    return (
        <div className={'h-1/4 w-fit flex space-x-0.5 justify-self-center'}>
            {genNums({count: 3}).map((value) => (
                <div className={'h-full aspect-square bg-gray-700 rounded-full'} key={`dots-${value}`}></div>
            ))}
        </div>
    )
}