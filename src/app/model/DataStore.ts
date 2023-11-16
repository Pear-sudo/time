import {CalendarEvent} from "@/app/model/eventData";
import {getDayId, getNextDate} from "@/app/utility/timeUtil";

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
        } else {
            throw new Error("Begin and End date must be set.")
        }
    }

    private dataMap: Map<string, CalendarEvent[]> = new Map()
}