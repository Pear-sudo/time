import React, {JSX, useState} from "react";

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

    private readonly vMap: Map<string, View> = new Map()

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
        const view = new View(op.view)
        this.vMap.set(key, view)

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
            const wrappedView = this.wrapView(view.view, key)
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

    private wrapView(view: JSX.Element, key: string | number): JSX.Element {
        this.currentZ += this.stepZ
        console.log(this.currentZ)
        return (
            <div key={key}>
                <div style={{zIndex: this.baseZ, width: '100dvw', height: '100dvh'}}
                     className={'fixed top-0 left-0 cursor-default'}
                >
                </div>
                <div className={'-translate-x-1/2 -translate-y-1/2 fixed'}
                     style={{zIndex: this.currentZ, top: '50%', left: '50%'}}>
                    {view}
                </div>
            </div>
        )
    }

    initContext(): JSX.Element {
        const [UiDate, setUiDate] = useState(new Date())
        this.isInitiated = true
        this.setUiDate = setUiDate

        return (
            <div>
                {this.generateWindows()}
            </div>
        )
    }
}

export interface CreateWindowOp {
    view: JSX.Element,
    key: string
    priority?: number
}

class View {
    get view(): React.JSX.Element {
        return this._view;
    }

    private readonly _view: JSX.Element
    private readonly _cTime: Date

    constructor(view: React.JSX.Element) {
        this._view = view;
        this._cTime = new Date()
    }

    get cTime(): Date {
        return this._cTime;
    }
}

class WindowController {
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