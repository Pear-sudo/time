export class CalendarEvent {
    // the standard iCalendar File Format: https://icalendar.org/
    title: string = ''
    description: string = ''
    location: string = ''
    begin: Date | undefined = undefined
    end: Date | undefined = undefined

    constructor(options?: CalendarEventOptions) {
        if (options) {
            if (options.begin)
                this.begin = options.begin
            if (options.end)
                this.end = options.end
        }
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

