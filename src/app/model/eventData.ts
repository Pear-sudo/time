import {Color} from "@/app/utility/color";

export class CalendarEvent {
    // the standard iCalendar File Format: https://icalendar.org/
    title: string = ''
    description: string = ''
    location: string = ''
    begin: Date | undefined = undefined
    end: Date | undefined = undefined
    color: Color | undefined
    createTimestamp: Date

    constructor(options?: CalendarEventOptions) {
        if (options) {
            if (options.begin)
                this.begin = options.begin
            if (options.end)
                this.end = options.end
        }
        this.createTimestamp = new Date()
    }
}

export interface CalendarEventOptions {
    begin: Date
    end: Date
}

export class CalendarEventExt extends CalendarEvent {
    constructor(options?: CalendarEventOptions) {
        super(options);
    }
}

type TimePoint = {
    time: number;
    type: 'start' | 'end';
    index: number;
};

export function countOverlaps(events: CalendarEvent[]): number[] {
    // this is an example of sweep line algorithm
    let points: TimePoint[] = [];
    events.forEach((event, index) => {
        // @ts-ignore
        points.push({time: event.begin.valueOf(), type: 'start', index});
        // @ts-ignore
        points.push({time: event.end.valueOf(), type: 'end', index});
    });

    // negative return value indicts it is smaller and should be placed ahead
    points.sort((a, b) => {
        if (a.time === b.time) {
            return a.type === 'end' ? -1 : 1;
        }
        return a.time - b.time;
    });

    let overlapCounts: number[] = new Array(events.length).fill(1);
    let activeIntervals: Set<number> = new Set();

    points.forEach(point => {
        if (point.type === 'start') {
            activeIntervals.forEach(index => {
                // for existing ones
                overlapCounts[index]++;
                // for this one
                overlapCounts[point.index]++;
            });
            activeIntervals.add(point.index);
        } else {
            activeIntervals.delete(point.index);
        }
    });

    // Each interval overlaps with itself, so we add 1 to each count
    return overlapCounts;
}

export function sortCalendarEvents(events: CalendarEvent[]) {
    events.sort((a, b) => {
        // @ts-ignore
        return a.begin.valueOf() - b.begin.valueOf()
    })
}

type Interval = [number, number];

export class IntervalStack {
    private readonly intervals: Interval[];

    constructor() {
        this.intervals = [];
    }

    countLayers(event: CalendarEvent): number {
        const newInterval = [event.begin, event.end]
        let layers = 1;

        for (const interval of this.intervals) {
            // @ts-ignore
            if (!(newInterval[1] <= interval[0] || newInterval[0] >= interval[1])) {
                layers += 1;
            }
        }

        // @ts-ignore
        this.intervals.push(newInterval);
        return layers;
    }
}

