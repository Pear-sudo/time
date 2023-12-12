import {CalendarEvent} from "@/app/model/eventData";
import React, {JSX, useContext, useEffect, useRef, useState} from "react";
import {DisplayContext, WindowController, WindowManager} from "@/app/utility/windowManager";
import {Day, Time} from "@/app/utility/timeUtil";
import {Color} from "@/app/utility/color";
import {Theme} from "@/app/theme";
import {ColorList, ColorRow} from "@/app/elements/colorList";
import {TextInput} from "@/app/elements/inputs/textInput";
import {DateTimeSelector} from "@/app/elements/inputs/datetimeSelector";

import {PopupResult, RefClass} from "@/app/elements/inputs/helper/inputHelper";

function CalendarEventCreator(prop: {
    callback?: (result: PopupResult, data: any) => void,
    existingCE?: CalendarEvent
    pending?: boolean
}): JSX.Element {
    const {displayContextObj, updateContext} = useContext(DisplayContext)
    const hintRef = useRef<HTMLSpanElement>(null);

    const calendarEventRef = useRef(initCalendarEvent());

    const beginDTRef = useRef(calendarEventRef.current.begin);
    const endDTRef = useRef(calendarEventRef.current.end);

    const titleRef = useRef(calendarEventRef.current.title);
    const locationRef = useRef(calendarEventRef.current.location);
    const descriptionRef = useRef(calendarEventRef.current.description);

    // @ts-ignore
    const colorRef = useRef(calendarEventRef.current.color ? Color.setColor(calendarEventRef.current.color._colorName) : Theme.defaultEventColor);

    function initCalendarEvent(): CalendarEvent {
        if (prop.existingCE) {
            return prop.existingCE
        }
        return new CalendarEvent()
    }

    function handleOutsideClick(wc: WindowController, event: React.MouseEvent) {
        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Cancelled, undefined)
        }
        if (prop.pending) {
            displayContextObj.dataStoreUpdatedTime = new Date()
        }
    }

    function handleTimeSelectorCallback(ref: React.MutableRefObject<Time | undefined>) {
        return (
            (time: Time) => {
                ref.current = time
            }
        )
    }

    function handleDaySelectorCallback(ref: React.MutableRefObject<Day | undefined>) {
        return (
            (day: Day) => {
                ref.current = day
            }
        )
    }

    function handleCreate(event: React.MouseEvent) {

        const calendarEvent = calendarEventRef.current

        calendarEvent.title = titleRef.current
        calendarEvent.description = descriptionRef.current
        calendarEvent.location = locationRef.current

        calendarEvent.color = colorRef.current

        if (!(calendarEvent.begin && calendarEvent.end)) {
            console.log("begin or end does not exist!")
            return;
        }

        if (calendarEvent.begin.valueOf() >= calendarEvent.end.valueOf() && hintRef.current) {
            hint("End time is earlier than begin time.")
            return
        } else {
            hint()
        }

        displayContextObj.dataStore.update(calendarEvent)
        displayContextObj.dataStoreUpdatedTime = new Date()

        event.stopPropagation()
        if (prop.callback) {
            prop.callback(PopupResult.Success, null)
        }
    }

    function hint(text?: string) {
        if (text) {
            if (hintRef.current) {
                hintRef.current.innerText = text
            }
        } else {
            if (hintRef.current && hintRef.current.innerText != "") {
                hintRef.current.innerText = ""
            }
        }
    }

    function handleDelete(event: React.MouseEvent) {
        if (prop.existingCE) {
            displayContextObj.dataStore.deleteCe(prop.existingCE)
            displayContextObj.dataStoreUpdatedTime = new Date()
            event.stopPropagation()
            if (prop.callback) {
                prop.callback(PopupResult.Delete, null)
            }
        } else {
            closeThisWindow()
            return
        }
    }

    function closeThisWindow() {
        new WindowManager().getController('logCreator')?.closeWindow()
    }

    function handleColorSelection(color: Color) {
        const controller = windowManager.getController('colorList')
        controller?.closeWindow()
    }

    function handleColorSelectorClick(event: React.MouseEvent) {
        windowManager.createWindow({
            view:
                <div className={'p-2'}>
                    <ColorList handleSelection={handleColorSelection} parentRef={new RefClass<Color>(colorRef)}/>
                </div>,
            key: 'colorList',
            rounded: true,
            handleOutSideClick: (wc: WindowController) => wc.closeWindow()
        })
    }

    const windowManager = new WindowManager()
    windowManager.setOnOutsideClick('logCreator', handleOutsideClick)

    const isNewCalendarEvent = !prop.existingCE || prop.pending

    return (
        <div
            className={'w-fit p-3 bg-cyan-50 cursor-default flex-col inline-flex gap-3'}
        >
            <TextInput placeholder={"Add title"} parentRef={new RefClass(titleRef)}/>
            <span className={'whitespace-nowrap'}>
                    Begin:
                <DateTimeSelector
                    parentRef={new RefClass<Date>(beginDTRef)}
                    default={beginDTRef.current}
                />
                </span>
            <br/>
            <span className={'whitespace-nowrap'}>
                    End:
                    <DateTimeSelector
                        parentRef={new RefClass<Date>(endDTRef)}
                        default={endDTRef.current}
                    />
                </span>
            <span ref={hintRef} className={'text-red-600 text-sm'}></span>

            <div onClick={handleColorSelectorClick}>
                <ColorRow color={colorRef.current} label={colorRef.current.colorName}/>
            </div>

            <TextInput placeholder={"Add location"} parentRef={new RefClass(locationRef)}/>
            <TextInput placeholder={"Add description"} parentRef={new RefClass(descriptionRef)}/>

            <div className={'mt-auto flex-row inline-flex'}>
                <button className={`${Theme.button} w-fit self-start`} onClick={handleDelete}>{!isNewCalendarEvent ? "Delete" : "Cancel"}</button>
                {!isNewCalendarEvent ? <button className={`${Theme.button}`} onClick={closeThisWindow}>Cancel</button> : undefined}
                <button className={`${Theme.button} w-fit self-end ml-auto`}
                        onClick={handleCreate}>{!isNewCalendarEvent ? "Update" : "Create"}</button>
            </div>
        </div>
    )
}

export function CalendarEventCreatorWrapper(prop: {
    existingCE?: CalendarEvent,
    pending?: boolean
}): JSX.Element {
    const [showSelf, setShowSelf] = useState(true)
    const controller = useRef<WindowController>();
    const windowManager = new WindowManager()
    useEffect(() => {
        if (prop.pending) {
            createWindow()
        }
    });

    function handleOnClick(event: React.MouseEvent) {
        createWindow()
        event.stopPropagation()
    }

    function handleCallback(result: PopupResult, data: any) {
        if (result == PopupResult.Cancelled) {
            closeWindow()
        } else if (result == PopupResult.Success) {
            closeWindow()
        } else if (result == PopupResult.Delete) {
            closeWindow()
        }
    }

    function closeWindow() {
        controller.current?.closeWindow()
    }

    function createWindow() {
        controller.current = windowManager.createWindow({
            view: <CalendarEventCreator callback={handleCallback} existingCE={prop.existingCE}
                                        pending={prop.pending}/>,
            key: 'logCreator',
            rounded: true
        })
    }

    return (
        <div>
            {showSelf && (
                <div className={'absolute hover:cursor-pointer w-full h-full z-10 top-0 left-0'}
                     onClick={handleOnClick}>
                </div>
            )}
        </div>
    )
}