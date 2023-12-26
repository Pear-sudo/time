import React from "react";
import {cloneDeep} from "lodash"
import {DataStore} from "@/app/model/DataStore";
import {BehaviorSubject} from "rxjs";

export class DisplayContextObj {
    get onDayCountOrAnchorChange(): ((count?: number, anchor?: Date) => void) | undefined {
        return this._onDayCountOrAnchorChange;
    }

    set onDayCountOrAnchorChange(value: (count?: number, anchor?: Date) => void) {
        this._onDayCountOrAnchorChange = value;
    }
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
            console.log('resetting context')
        }
    }

    constructor() {
        if (!DisplayContextObj.instance) {
            DisplayContextObj.instance = this
            this.loadDataStore()
        }
        return DisplayContextObj.instance
    }

    private async loadDataStore() {
        await this.dataStore.loadData()
        this.dataStoreUpdatedTime = new Date()
    }


    private static instance: DisplayContextObj;

    private _timeLineTop: number = 0
    private _slotHeight: number = 0
    private _dataStoreUpdatedTime: Date = new Date()
    private _setter: React.Dispatch<React.SetStateAction<DisplayContextObj>> | undefined = undefined
    private _dataStore: DataStore = new DataStore()
    private _scrolledY: number = 0
    private _onDayCountOrAnchorChange: ((count?: number, anchor?: Date) => void) | undefined
    private headerBgSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    get headerBg$() {
        return this.headerBgSubject.asObservable()
    }

    get scrolledY(): number {
        return this._scrolledY;
    }

    set scrolledY(value: number) {
        this._scrolledY = value;
        if (this.headerBgSubject.getValue() != value > 1) {
            this.headerBgSubject.next(!this.headerBgSubject.getValue())
        }
    }
}