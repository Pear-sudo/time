export class CalendarEvent {
    // the standard iCalendar File Format: https://icalendar.org/
    title: string = ''
    description: string = ''
    location: string = ''
    begin: Date | undefined = undefined
    end: Date | undefined = undefined

    constructor(begin: Date, end: Date) {
        this.begin = begin
        this.end = end
    }
}

export class CalendarEventExt extends CalendarEvent {
    constructor(begin: Date, end: Date) {
        super(begin, end);
    }
}

