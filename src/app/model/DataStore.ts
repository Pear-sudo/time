import {CalendarEvent} from "@/app/model/eventData";
import {getDayId, getNextDate} from "@/app/utility/timeUtil";
import * as localforage from "localforage";

export class DataStore {
    put(e: CalendarEvent) {
        this.mapInsert(e)
    }

    getEvents(d: Date): CalendarEvent[] {
        const key = getDayId(d)
        const data = this.dataMap.get(key)
        return data ? data : []
    }

    private mapInsert(e: CalendarEvent): void {
        const beginDate = e.begin
        const endDate = e.end

        if (beginDate && endDate) {
            const beginTime = beginDate.getTime()
            const endTime = endDate.getTime()
            let intermediateDate = beginDate
            for (let time = beginTime; time <= endTime; intermediateDate = getNextDate(intermediateDate, false, 0, true), time = intermediateDate.getTime()) {
                const date = new Date(time)
                const key = getDayId(date)

                if (!this.dataMap.has(key)) {
                    this.dataMap.set(key, [])
                }

                this.dataMap.get(key)!.push(e)
            }
            saveData(DataStore.key, this.dataMap)
        } else {
            throw new Error('Begin and End date must be set.')
        }
    }

    private async loadData() {
        const dm = await getDate(DataStore.key)
        this.dataMap = dm ? dm : new Map()
    }

    private dataMap: Map<string, CalendarEvent[]> = new Map()
    private static readonly key: string = "dataMapKey"

    constructor() {
        this.loadData()
    }
}

function saveData(key: string, data: any) {
    localforage.setItem(key, data)
}

async function getDate(key: string): Promise<any> {
    const s = await localforage.getItem(key)
    if (s) {
        return s
    }
}

function dateReviver(key: string, value: any) {
    var dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    if (typeof value === "string" && dateFormat.test(value)) {
        return new Date(value);
    }

    return value;
}
