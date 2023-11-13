import React from "react";
import {cloneDeep} from "lodash"
import {DataStore} from "@/app/model/DataStore";

export class DisplayContextObj {
    get dataStore(): DataStore {
        return this._dataStore;
    }

    set dataStore(value: DataStore) {
        this._dataStore = value;
    }
    get setter(): React.Dispatch<React.SetStateAction<DisplayContextObj>> | undefined {
        return this._setter;
    }

    set setter(value: React.Dispatch<React.SetStateAction<DisplayContextObj>>) {
        this._setter = value;
    }

    get dataStoreUpdatedTime(): Date {
        return this._dataStoreUpdatedTime;
    }

    set dataStoreUpdatedTime(value: Date) {
        this._dataStoreUpdatedTime = value;
        this.resetContext()
    }

    get slotHeight(): number {
        return this._slotHeight;
    }

    set slotHeight(value: number) {
        this._slotHeight = value;
    }


    get timeLineTop(): number {
        return this._timeLineTop;
    }

    set timeLineTop(value: number) {
        this._timeLineTop = value;
    }

    private getNewInstance() {
        return cloneDeep(this)
    }

    private resetContext() {
        if (this.setter) {
            this.setter(this.getNewInstance())
        }
    }

    constructor() {
        if (!DisplayContextObj.instance) {
            DisplayContextObj.instance = this
        }
        return DisplayContextObj.instance
    }


    private static instance: DisplayContextObj;

    private _timeLineTop: number = 0
    private _slotHeight: number = 0
    private _dataStoreUpdatedTime: Date = new Date()
    private _setter: React.Dispatch<React.SetStateAction<DisplayContextObj>> | undefined = undefined
    private _dataStore: DataStore = new DataStore()
}