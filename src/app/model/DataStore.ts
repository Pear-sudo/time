import {CalendarEvent} from "@/app/model/eventData";
import {getDayId} from "@/app/utility/timeUtil";

export class DataStore {
    put(e: CalendarEvent) {
        if (!(e.begin || e.end)) {
            throw new Error("Begin and End date must be set.")
        }
        this.data.push(e)
    }

    getEvents(d: Date): CalendarEvent[] {
        const matches: CalendarEvent[] = []
        for (const event of this.data) {
            const targetId = getDayId(d)
            if (event.begin && getDayId(event.begin) === targetId) {
                matches.push(event)
            }
        }
        return matches
    }

    private data: CalendarEvent[] = []
}