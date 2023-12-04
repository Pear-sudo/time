import React, {JSX} from "react";

export class WindowManager {
    static get ins(): WindowManager {
        return this._ins;
    }
    private static _ins: WindowManager

    private readonly baseZ: number = 1000

    private readonly vMap: Map<number, View> = new Map()

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
        const view = new View(op.view)
        const handle = view.cTime.valueOf()
        this.vMap.set(handle, view)
        return new WindowController(handle)
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

    private closeW(handle: number) {

    }

    private closeAll() {

    }

    private generateWindows(): JSX.Element[] {
        const ws: JSX.Element[] = []
        return ws
    }

    initContext(): JSX.Element {
        return (
            <div style={{zIndex: this.baseZ}}>
                {this.generateWindows()}
            </div>
        )
    }
}

export interface CreateWindowOp {
    view: JSX.Element,
    priority?: number
}

class View {
    private readonly view: JSX.Element
    private readonly _cTime: Date

    constructor(view: React.JSX.Element) {
        this.view = view;
        this._cTime = new Date()
    }

    get cTime(): Date {
        return this._cTime;
    }
}

class WindowController {
    private readonly _handle: number
    private readonly windowManager: WindowManager = new WindowManager()

    get handle(): number {
        return this._handle;
    }

    constructor(handle: number) {
        this._handle = handle;
    }

    closeWindow(): void {
        this.windowManager.closeWindow(this)
    }
}