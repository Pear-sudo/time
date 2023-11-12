export class DisplayContextObj {
    get slotHeight(): number {
        return this._slotHeight;
    }

    set slotHeight(value: number) {
        this._slotHeight = value;
    }

    private static instance: DisplayContextObj;

    constructor() {
        if (!DisplayContextObj.instance) {
            DisplayContextObj.instance = this
        }
        return DisplayContextObj.instance
    }

    get timeLineTop(): number {
        return this._timeLineTop;
    }

    set timeLineTop(value: number) {
        this._timeLineTop = value;
    }

    private _timeLineTop: number = 0
    private _slotHeight: number = 0
}